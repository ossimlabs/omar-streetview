package omar.streetview.app

import grails.async.web.AsyncController

class MapViewController implements AsyncController
{
	GeoscriptService geoscriptService

	def index() {}

	def getTile()
	{
		def ctx = startAsync()
		ctx.start {

			def results = geoscriptService.getTile( params )

			response.contentLength = results.contentLength
			render results
			ctx.complete()
		}
	}
}
