package omar.streetview.app

import geoscript.geom.Bounds
import geoscript.render.Map as GeoScriptMap
import geoscript.workspace.Directory
import geoscript.workspace.PostGIS
import org.springframework.beans.factory.annotation.Value

import static geoscript.style.Symbolizers.*

import org.springframework.util.FastByteArrayOutputStream
import org.springframework.beans.factory.annotation.Value

class GeoscriptService
{
	@Value( '${streetview.database.name}' )
	String databaseName

	@Value( '${streetview.database.user}' )
	String databaseUser

	@Value( '${streetview.database.password}' )
	String databasePassword

	@Value( '${streetview.database.host}' )
	String databaseHost

	@Value( '${streetview.shapeFile.layerName}' )
	String layerName

	@Value( '${streetview.shapeFile.baseDir}' )
	String baseDir

	static final int numBands = 4

	def getTile( def params )
	{
		def postgis = new PostGIS( databaseName,  host: databaseHost,
			user: databaseUser, password: databasePassword )

		def layerName = params.find { it.key.equalsIgnoreCase( 'LAYERS' ) }?.value?.toString()
		def layer = postgis[layerName]

		def width = params.find { it.key.equalsIgnoreCase( 'WIDTH' ) }?.value?.toInteger()
		def height = params.find { it.key.equalsIgnoreCase( 'HEIGHT' ) }?.value?.toInteger()
		def format = params.find { it.key.equalsIgnoreCase( 'FORMAT' ) }?.value
		def coords = params.find { it.key.equalsIgnoreCase( 'BBOX' ) }?.value?.split( ',' )?.collect { it.toDouble() }
		def crs = params.find { it.key.equalsIgnoreCase( 'CRS' ) }?.value
		def bbox = new Bounds( coords[1], coords[0], coords[3], coords[2], crs )

		layer.style = shape( type: "circle", size: 8, color: "#99CCFF" )

		def map = new GeoScriptMap(
			fixAspectRatio: false,
			width: width,
			height: height,
			type: format?.split( '/' )?.last(),
			bounds: bbox,
			proj: bbox?.proj,
			layers: [
				layer
			]
		)

		def ostream = new FastByteArrayOutputStream( width * height * numBands )

		map.render( ostream )
		map?.close()
		postgis?.close()

		[ contentType: format, file: ostream.inputStream, contentLength: ostream.size() ]
	}

	def loadShapeFile( def baseDir, def layerName )
	{
		def postgis = new PostGIS( databaseName, host: databaseHost,
			 user: databaseUser, password: databasePassword )

		if ( !postgis.has( layerName ) )
		{
			def shpDir = new Directory( baseDir )
			def inputLayer = shpDir[layerName]
			def outputLayer = postgis.create( inputLayer.schema )

			inputLayer.eachFeature { f ->
				outputLayer.add( f )
			}

			shpDir?.close()
		}

		postgis?.close()
	}

	def getImage( def params )
	{
		log.info( params as String )

		def svid = params.find { it.key.equalsIgnoreCase( 'SVID' ) }?.value ?: '10011059150713114256900'

		def postgis = new PostGIS( databaseName,  host: databaseHost,
			user: databaseUser, password: databasePassword )

		def layer = postgis[layerName]
		def feature = layer.getFeatures( filter: "svid='${ svid }'", max: 1 )?.first()
		def imageFile = "${ baseDir }/Images/${ feature.path }" as File

		postgis?.close()

		[ contentType: 'image/jpeg', contentLength: imageFile.size(), file: imageFile.newInputStream() ]
	}

	def findRecord( def params )
	{
		log.info( params as String )

		def svid = params.find { it.key.equalsIgnoreCase( 'SVID' ) }?.value ?: '10011059150713114256900'

		def postgis = new PostGIS( databaseName,  host: databaseHost,
			user: databaseUser, password: databasePassword )

		def layer = postgis[layerName]
		def feature = layer.getFeatures( filter: "svid='${ svid }'", max: 1 )?.first()
		def record = feature.geoJSON

		postgis?.close()
		record
	}
}
