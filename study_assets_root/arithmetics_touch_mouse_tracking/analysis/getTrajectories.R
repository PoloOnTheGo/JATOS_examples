rm(list=ls())
rootPath = '~/Dropbox/jatos/workshop_ASSC/examples/mentalArithmetics/'
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
data.empty <- data.frame(mouse.x = numeric(),
                         mouse.y = numeric(),
                         mouse.time = numeric(),
                         subject = factor(),
                         trial = factor())

#Initialize for all subjs pooled
data.long <- data.empty

for (subj in 1:nSubj){
  if (length(dataFiles)==1){
    resultData <- jsonlite::fromJSON(singleJSONs[[1]][subj])
  } else {
    resultData <- jsonlite::fromJSON(paste(dataPath,dataFiles[subj], sep=.Platform$file.sep))
  }
  
  # Initialize for a single subj
  data.long.thisSubj <- data.empty
  
  #Pool all trials together
  for (trial in c(1:length(resultData$x))){
    if (length(resultData$time[[trial]]>0)){
      mouse.time.vector <- resultData$time[[trial]]
      mouse.x.vector <- resultData$x[[trial]]
      mouse.y.vector <- resultData$y[[trial]]
    } else {
      mouse.time.vector <- NA
      mouse.x.vector <- NA
      mouse.y.vector <- NA
    }
    data.long.thisSubj <- rbind( data.long.thisSubj, 
                                 data.frame(mouse.time = mouse.time.vector,
                                            mouse.x = mouse.x.vector,
                                            mouse.y = mouse.y.vector,
                                            subject = factor(paste0('Subj', subj)),
                                            trial = factor(trial)))
  }
  #Pool all subjects together
  data.long <- rbind(data.long, data.long.thisSubj)
}

#Remove the NAs that we added below just to get the code to run
data.long <- subset(data.long, !is.na(mouse.x) )
#Then re-define as factor to remove NA as level
data.long$trial <- factor(data.long$trial)

ggplot(data.long, aes(x = mouse.x, y = -mouse.y)) +
  geom_point(aes(colour = trial)) + 
  facet_grid(subject ~ .)

