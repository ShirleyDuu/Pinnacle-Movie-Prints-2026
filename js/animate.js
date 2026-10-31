
// -------------------- animate texts using textillate -------------------- //

$(document).ready(function () {
  $('#web-name').textillate({
      in: {
          effect: 'fadeInLeft', 
          delayScale: 1.5,      
          delay: 50      
      },
      loop: true
  });
});


$(document).ready(function () {
  $('.animate-paragraph1').textillate({
      in: {
          effect: 'fadeInLeft',
          delayScale: 1.5,  
          delay: 5  
      },
      loop: true 
  });
});


$(document).ready(function () {
  $('.animate-paragraph2').textillate({
      in: {
          effect: 'fadeInUp', 
          delayScale: 1.5,  
          delay: 10  
      },
      loop: true 
  });
});


$(document).ready(function () {
  $('.animate-paragraph3').textillate({
      in: {
          effect: 'fadeInUp', 
          delayScale: 1.5,  
          delay: 20 
      },
      loop: true 
  });
});


$(document).ready(function () {
  $('.animate-paragraph4').textillate({
      in: {
          effect: 'fadeInLeft', 
          delayScale: 1.5,  
          delay: 30   
      },
      loop: true 
  });
});


$(document).ready(function () {
  $('#movie-title').textillate({
      in: {
          effect: 'fadeInLeft', 
          delayScale: 1.5,   
          delay: 30    
      },
      loop: true 
  });
});


$(document).ready(function () {
  $('.animate-paragraph').textillate({
      autoStart: true,
      in: {
          effect: 'fadeInLeft', 
          delayScale: 1.5,
          delay: 20
      }
  });
});






