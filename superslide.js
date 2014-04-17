/*
 * SuperSlide
 * Author: Adam Bulmer
 * Version: 1.0b
 */
$.fn.SuperSlide = function( opts ) {

  var settings = $.extend( {
    
    'auto' :       true,
    'pause' :      false,
    'pagination' : false,
    'navigation' : false,
    'pagination_selector' : ".slider__pagination",
    'navigation_btns' : '.slider__arrows',
    'panels_selector' : '.slider__panel',
    'timeout' : 3000,
    'visible_panels' : 1,

  }, opts );

  var consts = {
    PANEL_ACTIVE_CLASS : 'is-active'
  };

  var methods = {

    init : function( slider ) {

      // starting position, the current index.
      slider.current_index = 0;

      //Lets find our important elements
      slider.panels = slider.find( settings.panels_selector );
      slider.pagination_btns = slider.find( settings.pagination_selector ).find( 'a' );
      slider.navigation_btns = $( settings.navigation_btns );

      // store the number of panels
      slider.panels.count = slider.panels.size();

      if( settings.visible_panels > slider.panels.count ) { throw "Total number of visible panels exceeds total number of actual panels, exiting"; }

      // set default animating to false
      slider.animating = false;

      methods.setup_container( slider );
      methods.setup_panels( slider );
      methods.setup_pagination( slider );
      methods.setup_navigation( slider );
      methods.auto_cycle( slider );

    },
    setup_container: function( slider ){

      // Wrap up the panels into a container
      slider.panels.wrapAll( '<div class="slider__container" />' );

      // Store the panels container
      slider.panels_container = slider.find( '.slider__container' );

      // wrapper styles
      slider.panels_container.css( { 'width': ( slider.panels.count ) * 100 + '%' } );

      // set first as active
      slider.panels.eq( slider.current_index ).addClass( consts.PANEL_ACTIVE_CLASS );

    },
    setup_panels : function( slider ) {

      slider.panel_width = methods.get_visible_panels_value( slider ) / slider.panels.count;
      slider.panels.css( { 'width': slider.panel_width.toFixed( 4 ) + '%' } );

    },
    setup_current_panel : function( slider, index ) {
      
      slider.panels.removeClass( consts.PANEL_ACTIVE_CLASS );

      for( var i = index ; i < index + settings.visible_panels; i++ ) {
        slider.panels.eq( i ).addClass( consts.PANEL_ACTIVE_CLASS );
      }

    },
    get_visible_panels_value : function( slider ) {

      return 100 / settings.visible_panels;

    },
    slide : function( slider, index ) {

      if ( methods.supports_transitions() ) {

        var styles = {};
        var left_value = slider.panel_width * index;

        styles.transform = 'translate(' + '-' + left_value.toFixed(4) + '%, 0px)';
        styles.transition = settings.speed + 'ms cubic-bezier(0.25, 0.1, 0.25, 1)';

        slider.animating = true;
        slider.panels_container.css( styles );

        slider.current_index = index;
        methods.setup_current_panel( slider, index );

        setTimeout( function() {
          slider.animating = false;
        }, settings.speed );

      } else {

        var left_value = methods.get_visible_panels_value( slider ) * index;
        slider.animating = true;

        slider.panels_container.animate( { 'left': '-' + left_value + '%' }, settings.speed, function() {
          
          slider.current_index = index;
          methods.setup_current_panel( slider, index );
          
          slider.animating = false;

        });

      }

    },
    auto_cycle : function( slider ) {

      if ( slider.panels.count > 1 ) {

        if( settings.auto ) {

          slider.cycle = setInterval( function() {

            // clear any queued events
            slider.panels.finish();

            var index = 0;

            if( ( slider.current_index + 1 ) < ( slider.panels.count - ( settings.visible_panels - 1 ) ) ) {

              index = slider.current_index + 1;

            }

            if ( settings.pagination ) {
              methods.update_tabs( slider, index );
            }

            methods.slide( slider, index );

          }, settings.timeout );

        }

      }

    },
    restart_cycle : function( slider ) {

      if ( settings.auto ) {

        clearInterval( slider.cycle );
        methods.auto_cycle( slider );

      }

    },
    setup_pagination : function( slider ) {

      if ( settings.pagination ) {

        slider.pagination_btns.eq( 0 ).addClass( consts.PANEL_ACTIVE_CLASS );

        slider.pagination_btns.click( function(){

          var current_tab = $( this );

          methods.restart_cycle( slider );

          if ( current_tab.index() === slider.current_index ) {
              return;
          }

          methods.update_tabs( slider, current_tab.index() );
          methods.slide( slider, current_tab.index() );

          return false;

        });

      }

    },
    update_tabs : function( slider, index ) {

      slider.pagination_btns.removeClass( consts.PANEL_ACTIVE_CLASS ).eq( index ).addClass( consts.PANEL_ACTIVE_CLASS );

    },
    setup_navigation : function( slider ) {

      slider.navigation_btns.click( function(){

        var current_tab = $( this );

        methods.restart_cycle( slider );

        var active_panel = slider.find( '.' + consts.PANEL_ACTIVE_CLASS ),
            dir = current_tab.data( 'dir' );

        if ( active_panel.queue( 'fx' ).length ) {
            return;
        }

        // Should we move the slider, or should we reset it.

        if ( dir == 'prev' ) {
            index = ( slider.current_index == 0 ) ? slider.panels.count - 1 : slider.current_index - 1;
        } else {
            index = ( slider.current_index == ( slider.panels.count - 1 ) ) ? 0 : slider.current_index + 1;
        }

        methods.slide( slider, index );

        if ( settings.pagination ) {
          methods.update_tabs( slider, index );
        }

        return false;

      });

    },
    //checks to see if we support css transitions.
    supports_transitions : function() {

      if( 'Modernizr' in window ) {

          return Modernizr.csstransitions;

      }

      var body = document.body || document.documentElement;
      var style = body.style;
      var property = 'transition';

      if ( typeof style[ property ] == 'string' ) {
          return true;
      }

      // Tests for vendor specific prop
      version = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'], property = property.charAt( 0 ).toUpperCase() + property.substr( 1 );

      for ( var i = 0; i < version.length; i++ ) {

          if ( typeof style[ vesion[ i ] + property ] == 'string' ) {
              return true;
          }

      }

      return false;

    }

  };

  return $(this).each( function() {
    methods.init( $(this) );
  });

};