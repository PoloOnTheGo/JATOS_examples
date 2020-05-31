rootPath = '~/Dropbox/jatos/workshop_ASSC/examples/neglect'
jatosRoot = '/Applications/jatos-3.3.5_mac_java_old/study_assets_root/clock_drawing/'
dataPath = paste(rootPath, "jatosResults", sep=.Platform$file.sep)


#load necessary libraries
library(jsonlite)
library(png)
library(Hmisc)
library(Rcurl)
source(paste(jatosRoot, 'analysis', 'getImg.R', sep= .Platform$file.sep))

# Take all exported text files from JATOS. 
# This can either be a single .txt file with all the study results exported at once
# Or a list of individual results
# They can come from either the component or the study results view, but they should contain data from the task component alone
dataFiles <- list.files(path = dataPath, pattern = ".txt")

# If results were exported individually
if (length(dataFiles)==1){
  #Read the whole thing in 
  fileName <- paste(dataPath,dataFiles[subj], sep= .Platform$file.sep)
  allJSONs <- readChar(fileName, file.info(fileName)$size)
  singleJSONs <- Hmisc::string.break.line(allJSONs)
  JSONdata <- singleJSONs 
  nSubj <- length(JSONdata[[1]])
} else {
  JSONdata <- dataFiles
  nSubj <- length(JSONdata)
}

for (subj in 1:nSubj){
  if (length(dataFiles)==1){
    resultData <- jsonlite::fromJSON(singleJSONs[[1]][subj])
  } else {
    resultData <- jsonlite::fromJSON(paste(dataPath,dataFiles[subj], sep=.Platform$file.sep))
  }
  #Remove the first 31 characters: "\"imgData=data:image/png;base64,"
  #And the last 3 characters: \""
  textToConvert <- substr(resultData$image_data, 32, nchar(resultData$image_data)-3)
  
  #Plot and save
  jpeg(paste0(dataPath, .Platform$file.sep, "subj_", subj, "clock_R.png"))
  plot(1:2, type='n', axes=FALSE, xlab="", ylab="")
  rasterImage(getImg(textToConvert), 1, 1, 2, 2, interpolate=TRUE)
  dev.off()
}


