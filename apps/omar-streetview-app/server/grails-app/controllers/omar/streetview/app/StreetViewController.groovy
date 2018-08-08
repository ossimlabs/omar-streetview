package omar.streetview.app

import grails.async.web.AsyncController

class StreetViewController implements AsyncController
{
	GeoscriptService geoscriptService

	def index()
	{
		def record = geoscriptService.findRecord(params)

		render contentType: 'application/json', text: record
	}

	def getImage()
	{
		if(params.download) {
				response.setHeader "Content-disposition", "attachment; filename=${params.svid}.jpg"
		}

		def ctx = startAsync()

		ctx.start {
			def results = geoscriptService.getImage( params )

			response.contentLength = results.contentLength
			render results
			ctx.complete()
		}
	}
}
