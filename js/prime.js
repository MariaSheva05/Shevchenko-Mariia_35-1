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
});
