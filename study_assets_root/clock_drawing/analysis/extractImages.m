rootPath = '~/Dropbox/jatos/workshop_ASSC/examples/neglect';
jatosRoot = '/Applications/jatos-3.3.5_mac_java_old/study_assets_root/clock_drawing/';
dataPath = [rootPath filesep 'jatosResults'];

addpath(genpath([jatosRoot filesep 'analysis']))

dataFiles = dir([dataPath, filesep, '*.txt']);

if length(dataFiles)==1
    resultData = loadjson([dataPath, filesep, dataFiles(1).name]);
    nsubj = length(resultData);
    for subj = 1:nsubj
        %Remove the first 31 characters: "\"imgData=data:image/png;base64,"
        %And the last 3 characters: \""
        textToConvert = resultData{subj}{1}.image_data(32:end-3);
        %Save image
        base64decode(textToConvert, [dataPath filesep 'subj_' num2str(subj) 'clock_Matlab.png']);
    end
    
    
else
    for subj = 1:length(dataFiles)
        resultData = loadjson([dataPath, filesep, dataFiles(subj).name]);
        textToConvert = resultData{1}.image_data(32:end-3);
        base64decode(textToConvert, [dataPath filesep 'subj_' num2str(subj) 'clock_Matlab.png']);
    end
end

