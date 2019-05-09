$(document).ready(function(){
	
	
	//menu_btn functions
	let menu = false;
	$("#menu_btn").on("click", function(){
		
		if (!menu){
			//show menu
			$("#menu").animate({"top" : "0px"});
			
			//change menu_btn to cross
			$("#m_f").css({"transform" : "rotate(40deg)"});
			$("#m_t").css({"transform" : "rotate(-40deg)"});
			$("#m_s").css({"opacity" : "0"});
			
			menu = true;
		}
		else {
			//hide menu
			$("#menu").animate({"top" : "-400px"});
			
			//change menu_btn back to hamburger
			$("#m_f").css({"transform" : "rotate(0deg)"});
			$("#m_t").css({"transform" : "rotate(0deg)"});
			$("#m_s").css({"opacity" : "1"});
			
			menu = false;
		}
		
	});
	
	
	
	
	
	
	//load images
	var a = 30;
	var imageCode = '<a href="ORIGINALIMAGE" target="_blank"><img src="THUMBNAIL" class="image"></a>';
	var lastOne = "";
	var ready = true;
	
	db.collection("images").orderBy("date", "desc").limit(a).get().then(function(snapshot){
		
		//load image to each column
		var column = 1;
		for (var i = 0; i < snapshot.docs.length; i++){
			if (column === 1){
				//load image to first column
				$("#first").append(
					imageCode
					.split("ORIGINALIMAGE")
					.join(snapshot.docs[i].data().originalimage)
					.split("THUMBNAIL")
					.join(snapshot.docs[i].data().thumbimage)
				);
				lastOne = snapshot.docs[i];
				column = 2;
			}
			else if (column === 2){
				//load image to second column
				$("#second").append(
					imageCode
					.split("ORIGINALIMAGE")
					.join(snapshot.docs[i].data().originalimage)
					.split("THUMBNAIL")
					.join(snapshot.docs[i].data().thumbimage)
				);
				lastOne = snapshot.docs[i];
				column = 3;
			}
			else if (column === 3){
				//load image to third column
				$("#third").append(
					imageCode
					.split("ORIGINALIMAGE")
					.join(snapshot.docs[i].data().originalimage)
					.split("THUMBNAIL")
					.join(snapshot.docs[i].data().thumbimage)
				);
				lastOne = snapshot.docs[i];
				column = 1;
			}
		}
		
	}).then(function(){
		
		$("#loading").fadeOut(200);
		
	}).then(function(){
		
		//load more images
		$(window).on("scroll", function(){
			
			var mh = $("main").outerHeight();//get the full height of main
			var x = $(window).scrollTop();//get vertical scroll position
			var wh = $(window).innerHeight();//get window height
			var xx = x + (wh * 2);//add vertical scroll position with window height
			
			if (xx >= mh && ready){
				
				ready = false;
				
				db.collection("images").orderBy("date", "desc").startAfter(lastOne).limit(a).get().then(function(snapshot){
					
					//load more image to each column
					var column = 1;
					for (var i = 0; i < snapshot.docs.length; i++){
						if (column === 1){
							//load image to first column
							$("#first").append(
								imageCode
								.split("ORIGINALIMAGE")
								.join(snapshot.docs[i].data().originalimage)
								.split("THUMBNAIL")
								.join(snapshot.docs[i].data().thumbimage)
							);
							lastOne = snapshot.docs[i];
							column = 2;
						}
						else if (column === 2){
							//load image to second column
							$("#second").append(
								imageCode
								.split("ORIGINALIMAGE")
								.join(snapshot.docs[i].data().originalimage)
								.split("THUMBNAIL")
								.join(snapshot.docs[i].data().thumbimage)
							);
							lastOne = snapshot.docs[i];
							column = 3;
						}
						else if (column === 3){
							//load image to third column
							$("#third").append(
								imageCode
								.split("ORIGINALIMAGE")
								.join(snapshot.docs[i].data().originalimage)
								.split("THUMBNAIL")
								.join(snapshot.docs[i].data().thumbimage)
							);
							lastOne = snapshot.docs[i];
							column = 1;
						}
					}
					
				}).then(function(){
					
					setTimeout(function(){
						ready = true;
					}, 1000);
					
				});
				
			}
			
		});
		
	})
	
	
});























