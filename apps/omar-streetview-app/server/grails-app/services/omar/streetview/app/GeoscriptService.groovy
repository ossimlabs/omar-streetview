package omar.streetview.app

import geoscript.geom.Bounds
import geoscript.render.Map as GeoScriptMap
import geoscript.workspace.Directory
import geoscript.workspace.PostGIS
import org.springframework.beans.factory.annotation.Value

import static geoscript.style.Symbolizers.*

import org.springframework.util.FastByteArrayOutputStream
import org.springframework.beans.factory.annotation.Value

import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.amazonaws.services.s3.AmazonS3ClientBuilder

import org.springframework.util.FastByteArrayOutputStream

import javax.annotation.PostConstruct

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

	// @Value( '${streetview.shapeFile.baseDir}' )
	// String shapeFileBaseDir

	@Value( '${streetview.images.baseDir}' )
	String imagesBaseDir

	static final int numBands = 4

	def grailsApplication

	def s3
	def bucketName
	def prefix

	@PostConstruct
	def init() {
		def p = 's3://([^/]+)((/[^/]+)*)'
		def m = imagesBaseDir =~ p

		if ( m ) {
			bucketName = m[0][1]
			prefix = (m[0][2])[1..-1]
			s3 = AmazonS3ClientBuilder.standard().withCredentials(getProvider()).build()
		}
	}

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
		def results = getImageInputStream(feature.path)

		postgis?.close()

		[ contentType: 'image/jpeg', contentLength: results.size, file: results.inputStream ]
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

	def getImageInputStream(String path)
	{
	 	if ( s3 ) {
			def key = "${prefix ?: ''}/${path}"

			// println ([bucketName, key])

			def s3Object = s3.getObject(bucketName, key)
			def ostream = new FastByteArrayOutputStream(3_000_000)

			ostream << s3Object.objectContent
			s3Object.close()
			[size: ostream.size(), inputStream: ostream.inputStream]
	 	} else {
			def imageFile = "${ imagesBaseDir }/${ path }" as File

			[size: imageFile.size(), inputStream: imageFile.newInputStream()]
		}
	}

	def getProvider()
	{
			def profileName = grailsApplication.config.images.profile
			new ProfileCredentialsProvider(profileName ?: 'default')
	}
}
