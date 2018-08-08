# OMAR Streetview

## Purpose
The OMAR Streetview Service provides the ability to view street level imagery.  Users can pan, and zoom in a 360 degree direction to view the images.

## Installation in Openshift

**Assumption:** The omar-streetview-app image is pushed into the Openshift server's internal Docker registry and is available to the project.

### Persistent Volumes

OMAR Streetview requires shared access to the OSSIM imagery data directory.  This data is assumed to be accessible from the local filesystem of the pod.  Therefore, a volume mount must be mapped into the container.  A PersistentVolumeClaim should be mounted to '/data', but can be configured using the deploymentConfig.

## Environment variables

|Variable|Value|
|------|------|
|SPRING_PROFILES_ACTIVE|Comma separated profile tags (*e.g. production, dev*)|
|SPRING_CLOUD_CONFIG_LABEL|The Git branch from which to pull config files (*e.g. master*)|

## Using the service
The Streetview service provides access to street level imagery for a given area. [Example Streetview UI page](https://omar-dev.ossim.io/omar-streetview/streetview/10011059150713114359400)