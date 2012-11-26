function startCRUDGrid(){

	$.model.data.each(function(item){
		$('#grid-row-tpl').mu(item).stache('#table-grid tbody')
	})

	$('.crud-row').click(function(){ 
		var id = $(this).attr('data-id')
		  , url = '/spec/'+id

		window.location.href = url;
	})

	$('.crud-new' ).click(function(){ 
		window.location.href = '/spec/new'
	})
}

$(document).ready(function(){

	startCRUDGrid()

})