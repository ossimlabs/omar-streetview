package omar.streetview.app

import org.geotools.factory.Hints
import org.springframework.beans.factory.annotation.Value

class BootStrap {
  @Value( '${streetview.shapeFile.baseDir}' )
	String baseDir

	@Value( '${streetview.shapeFile.layerName}' )
	String layerName

	GeoscriptService geoscriptService

	def init = { servletContext ->
		Hints.putSystemDefault( Hints.FORCE_LONGITUDE_FIRST_AXIS_ORDER, Boolean.TRUE )

		geoscriptService.loadShapeFile( baseDir, layerName )
	}

  def destroy = {
  }
}
