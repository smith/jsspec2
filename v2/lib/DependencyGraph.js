function main(args) {
	if(args.length !== 3) {
		print("Usage:");
		print("> java -jar js.jar DependencyGraph.js <base_dir> <source_file_name_without_extension> <output_dir>");
		return;
	}
	
	var srcBaseDir = args[0];
	var srcFileName = args[1];
	var outputDir = args[2];
	
	var fileNames = collectRequiredFileNames(srcBaseDir, srcFileName + ".js");
	writeFile(outputDir + srcFileName + "_list", fileNames.join("\n"));
	mergeFiles(outputDir + srcFileName + ".js", srcBaseDir, fileNames);
}

function collectRequiredFileNames(baseDir, fileName, collectedFiles, queue) {
	collectedFiles = collectedFiles || [];
	queue = queue || [];
	
	if(collectedFiles.indexOf(fileName) !== -1) return collectedFiles;
	if(queue.indexOf(fileName) !== -1) {
		print("[Warning] circular dependency: " + fileName);
		return collectedFiles;
	}
	
	queue.push(fileName);
	
	var file = new java.io.File(baseDir, fileName);
	if(!file.isFile()) throw "[" + fileName + "] is a directory or not exist.";
	
	var source = readFile(baseDir + fileName);
	var tags = extractTagsFromSource(source);
	var requiredFiles = getRequiredFilesFromTags(tags);
	
	for(var i = 0; i < requiredFiles.length; i++) {
		collectRequiredFileNames(baseDir, requiredFiles[i], collectedFiles, queue);
	}
	collectedFiles.push(fileName);
	
	return collectedFiles;
}

function extractTagsFromSource(source) {
	var tags = [];
	var jsdoc_comments = source.replace(/\/\*\*([\s\S]+?)\*\//img, function(str, doc) {
		doc.replace(/@(\w+)\s+([^@\r\n$]+)/img, function(str, key, value) {
			tags.push({"key":key, "value":value.strip()});
		});
	});
	return tags;
}

function getRequiredFilesFromTags(tags) {
	var files = [];
	for(var i = 0; i < tags.length; i++) {
		if(tags[i].key == "requires") files.push(tags[i].value);
	}
	return files;
}

function writeFile(fileName, content) {
	var file = new java.io.File(fileName);
	file.getParentFile().mkdirs();
	
	var fw = new java.io.FileWriter(fileName);
	try {
		fw.write(content);
	} finally {
		if(fw) try {fw.close();} catch(ignored) {}
	}
}

function mergeFiles(fileName, baseDir, fileNamesToMerge) {
	var file = new java.io.File(fileName);
	file.getParentFile().mkdirs();

	var fw = new java.io.FileWriter(fileName);
	try {
		for(var i = 0; i < fileNamesToMerge.length; i++) {
			fw.write(readFile(baseDir + fileNamesToMerge[i]));
			fw.write("\n");
		}
	} finally {
		if(fw) try {fw.close();} catch(ignored) {}
	}
}

String.prototype.strip = function() {
	return this.replace(/^\s+/, '').replace(/\s+$/, '');
};

main(arguments);