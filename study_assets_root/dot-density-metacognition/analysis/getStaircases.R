rm(list=ls())
rootPath = '~/Dropbox/jatos/workshop_ASSC/examples/metacog/'
dataPath = paste0(rootPath, "jatosResults/")

#load necessary libraries
library(jsonlite)
library(ggplot2)
library(plyr)

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
data.empty <- data.frame(dots_num_left = numeric(),
                         dots_num_right = numeric(),
                         subject = factor(),
                         trial = numeric())

#Initialize for all subjs pooled
data.long <- data.empty

for (subj in 1:nSubj){
  if (length(dataFiles)==1){
    resultData <- jsonlite::fromJSON(singleJSONs[[1]][subj])
  } else {
    resultData <- jsonlite::fromJSON(paste(dataPath,dataFiles[subj], sep=.Platform$file.sep))
  }
  data.long.thisSubj <- resultData %>% 
                        mutate(dotsDifference = abs(dots_num_left-dots_num_right), 
                               subject = factor(paste0('Subj ', subj)),
                               trial = c(1:dim(resultData)[1]))

  #Pool all subjects together
  data.long <- rbind(data.long, data.long.thisSubj)
}

ggplot(data.long, aes(x = trial, y = dotsDifference)) +
  geom_point(aes(colour = discrimination_is_correct)) + 
  geom_line() +
  facet_grid(subject ~ .)

