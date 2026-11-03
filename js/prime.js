// BLESS PRIME: header shadow, scroll reveal, catalog filter
$(function () {
   var $header = $('.header_section');
   $(window).on('scroll', function () {
      $header.toggleClass('scrolled', $(window).scrollTop() > 10);
   });

   var $items = $('.why_section .box, .product_section .box, .blog_box, .arrival_section .box, .subscribe_section .box, .client_section .box');
   $items.addClass('reveal');
   if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
         entries.forEach(function (e) {
            if (e.isIntersecting) {
               e.target.classList.add('visible');
               io.unobserve(e.target);
            }
         });
      }, { threshold: 0.12 });
      $items.each(function () { io.observe(this); });
   } else {
      $items.addClass('visible');
   }

   $('.filter_btn').on('click', function () {
      var f = $(this).data('filter');
      $('.filter_btn').removeClass('active');
      $(this).addClass('active');
      $('.product_item').each(function () {
         var tags = String($(this).data('tags'));
         $(this).toggleClass('hide', f !== 'all' && tags.indexOf(f) === -1);
      });
   });

   // ===== Google Analytics 4: воронка продажів =====
   // перегляд каталогу -> додавання в кошик -> оформлення -> заявка
   function track(name, params, done) {
      var called = false;
      function next() { if (!called) { called = true; if (done) done(); } }
      if (typeof gtag === 'function') {
         params = params || {};
         params.event_callback = next;
         params.transport_type = 'beacon';
         gtag('event', name, params);
         setTimeout(next, 700);
      } else { next(); }
   }
   function itemOf($box) {
      var name = $.trim($box.find('.detail-box h5').first().text());
      var price = parseInt($box.find('.detail-box h6').first().text().replace(/\D/g, ''), 10) || 0;
      return { item_id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), item_name: name, item_brand: name.split(' ')[0], price: price, quantity: 1 };
   }
   function save(item) { try { sessionStorage.setItem('bp_item', JSON.stringify(item)); } catch (e) {} }
   function load() { try { return JSON.parse(sessionStorage.getItem('bp_item')); } catch (e) { return null; } }

   // 1. перегляд списку товарів
   var $cards = $('.product_section .box');
   if ($cards.length) {
      var list = [];
      $cards.slice(0, 12).each(function () { list.push(itemOf($(this))); });
      track('view_item_list', { item_list_name: 'Каталог BLESS PRIME', items: list });
   }

   // 2. «В кошик» і 3. «Купити»
   $('.product_section .option1, .product_section .option2').on('click', function (ev) {
      var $a = $(this), href = $a.attr('href'), item = itemOf($a.closest('.box'));
      var isCart = $a.hasClass('option1');
      save(item);
      ev.preventDefault();
      track(isCart ? 'add_to_cart' : 'begin_checkout',
         { currency: 'UAH', value: item.price, items: [item] },
         function () { window.location.href = href; });
   });

   // перехід на сторінку контактів після «Купити»
   if (/contact\.html/.test(location.pathname)) {
      var it = load();
      if (it) { track('view_cart', { currency: 'UAH', value: it.price, items: [it] }); }
   }

   // 4. заявка через форму замовлення (навчальна, дані не зберігаються)
   $('form').has('[name=phone]').on('submit', function (ev) {
      var form = this, it = load();
      var model = $.trim($(form).find('[name=subject]').val() || '');
      ev.preventDefault();
      track('generate_lead', {
         currency: 'UAH', value: it ? it.price : 0,
         lead_source: 'contact_form', item_name: it ? it.item_name : model
      }, function () { form.submit(); });
   });

   // підписка на розсилку
   $('.subscribe_section form, footer form').on('submit', function (ev) {
      var form = this;
      ev.preventDefault();
      track('sign_up', { method: 'newsletter' }, function () { form.submit(); });
   });
});
