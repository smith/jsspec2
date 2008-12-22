(function() {
	var verbDic = {
		'열기': 'open',
		'클릭': 'click'
	};
		
	var nounDic = {
		'제목': 'Title',
		'활성상태': 'Editable',
		'편집가능': 'Editable',
		'체크상태': 'Checked',
		'본문텍스트': 'BodyText',
		'값': 'Value',
		'텍스트': 'Text',
		'위치': 'Location',
		'속성': 'Attribute',
		'텍스트있음': 'TextPresent',
		'텍스트없음': 'TextNotPresent',
		'엘리먼트있음': 'ElementPresent',
		'엘리먼트없음': 'ElementNotPresent'
	};

	var pAssert = /^(.+?)( 불일치| 아님)? (확인|검사)$/;
	var pAndWait = /^(.+?) 후 대기$/;
	
	
	
	function globalizeCommand(cmd) {
		if(!cmd) return cmd;
		
		var command = cmd.command;
		var target = cmd.target;
		
		var m;
		
		// intentional use of assignment operators
		if(m = command.match(pAssert)) {
			var noun = nounDic[m[1]] || m[1];
			var negation = m[2] ? 'Not' : '';
			var verb = m[3] === '확인' ? 'assert' : 'verify';
			command = verb + negation + noun;
		} else if(m = command.match(pAndWait)) {
			var verb = verbDic[m[1]] || m[1];
			command = verb + 'AndWait';
		} else if(verbDic[command]) {
			command = verbDic[command];
		}
		
		cmd.command = command;
		cmd.target = target;
		
		return cmd;
	}
	
	function localizeMessage(message) {
		if(!message) return message;
		
		// 번역...
		
		return message;
	}
	
	
	
	function nextCommand() {
		return globalizeCommand(this.nextCommandOriginal());
	}
	function commandError(message) {
		this.commandErrorOriginal(localizeMessage(message));
	}
	
	
	
	function override(base) {
		if(!base) return;
		
		base.prototype.nextCommandOriginal = base.prototype.nextCommand;
		base.prototype.nextCommand = nextCommand;
		
		base.prototype.commandErrorOriginal = base.prototype.commandError;
		base.prototype.commandError = commandError;
	}
	
	
	
	override(this.HtmlRunnerTestLoop);
	override(this.RemoteRunner);
})();