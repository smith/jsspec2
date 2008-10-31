with(jsspec.bdd_dsl) {
	scenario('시나리오 실행하기', function() {
		_['실행됨'] = false;
		_.scenario = new jsspec.Scenario('시나리오 이름', function() {
			_['실행됨'] = true;
		});
		_.scenario.run();
		
		value_of('실행됨').should_be(true);
	});
	
	scenario('시나리오 여러개 실행하기', function() {
		// given
		_['실행 횟수'] = 0;
		
		// when
		_.runner = new jsspec.Runner();
		_.runner.addScenario(new jsspec.Scenario('시나리오1', function() {_['실행 횟수']++;}));
		_.runner.addScenario(new jsspec.Scenario('시나리오2', function() {_['실행 횟수']++;}));
		_.runner.run();
		
		// then
		value_of('실행 횟수').should_be(2);
	});
	
	scenario('실패하면 메시지가 나와야 한다', function() {
		// when
		jsspec.switchLogger({log: function(message) {_['에러메시지'] = message;}});
		try {
			_.scenario = new jsspec.Scenario('실패하는 시나리오', function() {
				_['one'] = 2;
				value_of('one').should_be(1);
			});
			_.scenario.run();
		} finally {
			jsspec.restoreLogger();
		}
		
		// then
		value_of('에러메시지').should_be('- 실패하는 시나리오: [one] should be [1] but [2]');
	});
	
	scenario('한글 리포터', function() {
		// when
		jsspec.switchLogger({log: function(message) {_['에러메시지'] = message;}});
		jsspec.switchReporter(new jsspec.KoreanReporter());
		
		try {
			_.scenario = new jsspec.Scenario('실패하는 시나리오', function() {
				_['one'] = 2;
				value_of('one').should_be(1);
			});
			_.scenario.run();
		} finally {
			jsspec.restoreLogger();
			jsspec.restoreReporter();
		}
		
		// then
		value_of('에러메시지').should_be('- 실패하는 시나리오: [one]의 값은 [1]이어야 하지만 [2]이기 때문에 실패했습니다.');
	});
	
	scenario('우왕ㅋ', function() {
		value_of('엉?').should_be('ㅋ');
	})
	
	run();
}
