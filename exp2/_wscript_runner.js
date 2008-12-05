function readFile(path) {
	var fso = new ActiveXObject('Scripting.FileSystemObject');
	var file;
	try {
		file = fso.OpenTextFile(path);
		return file.ReadAll();
	} finally {
		try {if(file) file.Close();} catch(ignored) {}
	}
}

eval(readFile('src/jsspec2.js'));
eval(readFile('specs/spec.js'));