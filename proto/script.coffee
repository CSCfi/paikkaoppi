$ ->

  $window = $(window)

  $window.on 'hashchange', (e) ->
    $window.trigger 'loadView'

  $window.on 'loadView', (e) ->

    $('.view').add('.popup').hide()
    
    if window.location.hash=='' || window.location.hash=='#'
      $('#login').show()
    else
      if $(window.location.hash).hasClass('popup')
        $(window.location.hash).parents('.view').show()

      $(window.location.hash).show()

  $window.trigger 'loadView'