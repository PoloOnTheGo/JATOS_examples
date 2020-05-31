rm(list=ls())
rootPath = '~/Dropbox/jatos/workshop_ASSC/examples/bistableImages/'
dataPath = paste0(rootPath, "jatosResults/")


#load necessary libraries
library(jsonlite)
library(ggplot2)
library(Hmisc)

# Take all exported text files from JATOS. 
# This can either be a single .txt file with all the study results exported at once
# Or a list of individual results
# They can come from either the component or the study results view, but they should contain data from the task component alone
dataFiles <- list.files(path = dataPath, pattern = ".txt")

# If results were exported individually
if (length(dataFiles)==1){
  #Read the whole thing in 
  for (subj in 1:length(dataFiles)){
    fileName <- paste0(dataPath,dataFiles[subj])
    allJSONs <- readChar(fileName, file.info(fileName)$size)
  }
  singleJSONs <- Hmisc::string.break.line(allJSONs)
  JSONdata <- singleJSONs 
  nSubj <- length(JSONdata[[1]])
} else {
  JSONdata <- dataFiles
  nSubj <- length(JSONdata)
}

# Initialize general data structure
data.empty <- data.frame(response.time = numeric(),
                         response.key = factor(),
                         subject = factor(),
                         trial = numeric(),
                         t0 = numeric())

#Initialize for all subjs pooled
data.long <- data.empty


for (subj in c(1:nSubj)){
  if (length(dataFiles)==1){
    resultData <- jsonlite::fromJSON(singleJSONs[[1]][subj])
  } else {
    resultData <- jsonlite::fromJSON(paste(dataPath,dataFiles[subj], sep=.Platform$file.sep))
  }
  
  # Initialize for a single subj
  data.long.thisSubj <- data.empty
  
  #Pool all trials together
  for (trial in c(1:length(resultData$responseTime))){
    
    if (length(resultData$responseTime[[trial]])>0){
      responseTime.vector <- resultData$responseTime[[trial]]
      responseKey.vector <- resultData$responseKey[[trial]]
      t0 = resultData$videoOnsetTime[trial]
      
      data.long.thisSubj <- rbind(data.long.thisSubj, 
                                  data.frame(response.time = responseTime.vector,
                                             response.key = responseKey.vector,
                                             subject = factor(paste0('Subj', subj)),
                                             trial = trial,
                                             t0 = t0))
    } 
  }
  
  #In JATOS we only store keydown and keyup events. 
  #Here, we fill in the whole pressed duration post-hoc 
  data.expanded.thisSubj <- data.empty
  timeStep = 40
  for (datapoint in c(1:(length(data.long.thisSubj$response.time)-1))){
    data.expanded.thisSubj <- rbind(data.expanded.thisSubj,
                                    data.frame(response.time =  seq(data.long.thisSubj$response.time[datapoint], data.long.thisSubj$response.time[datapoint+1], by=timeStep),
                                               response.key = data.long.thisSubj$response.key[datapoint],
                                               subject =  data.long.thisSubj$subject[datapoint],
                                               trial = data.long.thisSubj$trial[datapoint],
                                               t0 = data.long.thisSubj$t0[datapoint]
                                         )
    )
  }
  
  #Pool all subjects together
  data.long <- rbind(data.long, data.expanded.thisSubj)
}

#Then remove 'none' datapoints and re-define as factor to remove NA as level
data.long <- subset(data.long, response.key != "none")
data.long$response.key <- factor(data.long$response.key)



ggplot(data.long, aes(x = response.time-t0, y = trial, colour=response.key)) +
  geom_point() + 
  facet_grid(subject ~ .)
