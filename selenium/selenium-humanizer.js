// Selenium Humanizer
(function() {
	var verbDic = {
		'열기': 'open',
		'클릭': 'click',
		'입력': 'type'
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
	
	var locatorDic = {
		'버튼': 'button',
		'체크박스': 'checkbox',
		'라디오버튼': 'radio button',
		'텍스트상자': 'text field',
		'선택메뉴': 'dropdown menu',
		'링크': 'link'
	};
	
	// patterns for command
	var pAssert = /^(.+?)( 불일치| 아님)? (확인|검사)$/;
	var pAndWait = /^(.+?) 후 대기$/;
	
	// patterns for locator
	var pNLLocator = /^['"](.+)['"] (버튼|체크박스|라디오버튼|텍스트상자|선택메뉴|링크)$/;
	
	
	
	function globalize(cmd) {
		if(!cmd) return cmd;
		
		cmd.command = globalizeCommand(cmd.command);
		cmd.target = globalizeTarget(cmd.target);
		
		return cmd;
	}
	
	function localizeMessage(message) {
		if(!message) return message;
		
		var m;
		var globalized;
		
		// intentional use of assignment operators
		if(m = message.match(pAssert)) {
			var noun = nounDic[m[1]] || m[1];
			var negation = m[2] ? 'Not' : '';
			var verb = m[3] === '확인' ? 'assert' : 'verify';
			globalized = verb + negation + noun;
		} else if(m = message.match(pAndWait)) {
			var verb = verbDic[m[1]] || m[1];
			globalized = verb + 'AndWait';
		} else if(verbDic[message]) {
			globalized = verbDic[message];
		}
		
		return globalized || message;
	}
	
	function globalizeCommand(command) {
		var m;
		var globalized;
		
		// intentional use of assignment operators
		if(m = command.match(pAssert)) {
			var noun = nounDic[m[1]] || m[1];
			var negation = m[2] ? 'Not' : '';
			var verb = m[3] === '확인' ? 'assert' : 'verify';
			globalized = verb + negation + noun;
		} else if(m = command.match(pAndWait)) {
			var verb = verbDic[m[1]] || m[1];
			globalized = verb + 'AndWait';
		} else if(verbDic[command]) {
			globalized = verbDic[command];
		}
		
		return globalized || command;
	}
	
	function globalizeTarget(target) {
		var m;
		var globalized;
		
		// intentional use of assignment operators
		if(m = target.match(pNLLocator)) {
			globalized = 'nl="' + m[1] + '" ' + locatorDic[m[2]];
		}
		
		return globalized || target;
	}
	
	
	
	function nextCommand() {
		return globalize(this.nextCommandOriginal());
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
	
	
	
	PageBot.prototype.locateElementByNL = function(lang, inDocument, inWindow) {
		var pButton = /^['"](.+)['"] button$/;
		var pLabel = /^['"](.+)['"] (checkbox|radio button|text field|text area|dropdown menu)$/;
		var pLink = /^['"](.+)['"] link$/;
		
		var m;
		
		if(m = lang.match(pButton)) return this.locateElementByButtonText(m[1], inDocument, inWindow);
		if(m = lang.match(pLabel)) return this.locateElementByLabel(m[1], inDocument, inWindow);
		if(m = lang.match(pLink)) return this.locateElementByLinkText(m[1], inDocument, inWindow);
		
		return null;
	};
	PageBot.prototype.locateElementByLabel = function(label, inDocument, inWindow) {
	    var label = this.locateElementByXPath("//label[text()='" + label + "']", inDocument, inWindow);
	    if(!label) return null;
	    
	    var id = label.getAttribute('for') || label.htmlFor;
	    if(!id) return null;
	    
	    return this.locateElementById(id, inDocument, inWindow) || null;
	};
	PageBot.prototype.locateElementByButtonText = function(text, inDocument, inWindow) {
		// first, try input@value
		var input = this.locateElementByXPath("//input[@value='" + text + "']", inDocument, inWindow);
		if(input) return input;
		
		// second, try button's text
		var button = this.locateElementByXPath("//button[text()='" + text + "']", inDocument, inWindow);
		if(button) return button;
		
	    return null;
	}
	PageBot.prototype.locateElementByButtonText.prefix = 'button';
})();