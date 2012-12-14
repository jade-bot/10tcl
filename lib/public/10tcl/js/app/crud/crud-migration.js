$(document).ready(function(){

	$('#csv-to-json').click(function(){
		var val = $('#records').val().replace(/["']/g, '')
		  , records = []
		  , headers = []
		val.lines(function(line, i){

			var collumns, key, val, record = {}
			if (i===0){
				headers = line.split(',')
			} else {
				columns = line.split(',')
				headers.each(function(header, i){
					key = header.trim()
					val = columns[i].trim()

					record[key] = val

				})
				records.push(record)
			}

		})

		$('#records').val(JSON.stringify(records))
	})

})