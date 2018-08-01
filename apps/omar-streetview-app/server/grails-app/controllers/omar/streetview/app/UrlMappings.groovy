package omar.streetview.app

import grails.util.Environment

class UrlMappings {

    static mappings = {

        "/mapView/$action"(controller: 'mapView')
        "/streetView/$action"(controller: 'streetView')
        "/streetview/**"(uri: '/index.html')

        delete "/$controller/$id(.$format)?"(action: 'delete')
        get "/$controller(.$format)?"(action: 'index')
        get "/$controller/$id(.$format)?"(action: 'show')
        post "/$controller(.$format)?"(action: 'save')
        put "/$controller/$id(.$format)?"(action: 'update')
        patch "/$controller/$id(.$format)?"(action: 'patch')

        if ( Environment.current == Environment.PRODUCTION ) {
          '/'(uri: '/index.html')
        } else {
          '/'(controller: 'application', action:'index')
        }

        '500'(view: '/error')
        '404'(view: '/notFound')
    }
}
