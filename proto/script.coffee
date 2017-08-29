$ ->

  $window = $(window)

  $window.on 'hashchange', (e) ->
    $window.trigger 'loadView'

  $window.on 'loadView', (e) ->

    $('.view').hide()
    
    if window.location.hash=='' || window.location.hash=='#'
      $('#login').show()
    else
      $(window.location.hash).show()

  $window.trigger 'loadView'