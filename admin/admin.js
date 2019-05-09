$(document).ready(function(){
	
	//global variables
	var imageCode = "<a href='#id=IMAGEID'><img src='THUMBNAIL' class='image'></a>";
	var imageUrl;
	
	
	
	
	
	
	//login
	auth.onAuthStateChanged(function(user){
		
		if (user){
			$(".admin").css({"display" : "block"});
			$("#login").css({"display" : "none"});
			
			
			//load images
			var lastOne = "";
			var ready = true;
			var a = 20;

			db.collection("images").orderBy("date", "desc").limit(a).get().then(function(snapshot){

				for (var i = 0; i < snapshot.docs.length; i++){

					$("main").append(
						imageCode
						.split("IMAGEID")
						.join(snapshot.docs[i].id)
						.split("THUMBNAIL")
						.join(snapshot.docs[i].data().thumbimage)
					);

					lastOne = snapshot.docs[i];
				}

			}).then(function(){

				$(window).on("scroll", function(){

					var mh = $("main").outerHeight();
					var y = $(window).scrollTop();
					var h = $(window).innerHeight();
					var yy = y + (y + (y * 2));

					if (yy >= mh && ready){

						ready = false;

						db.collection("images").orderBy("date", "desc").startAfter(lastOne).limit(a).get().then(function(snapshot){

							for (var i = 0; i < snapshot.docs.length; i++){

								$("main").append(
									imageCode
									.split("IMAGEID")
									.join(snapshot.docs[i].id)
									.split("THUMBNAIL")
									.join(snapshot.docs[i].data().thumbimage)
								);

								lastOne = snapshot.docs[i];
							}

						}).then(function(){

							setTimeout(function(){
								ready = true;
							}, 1000);

						});

					}

				});

			});
		}
		else {
			$("#login").css({"display" : "block"});
			$(".admin").css({"display" : "none"});
		}
		
	});
	
	$("#login").on("submit", function(e){
		
		e.preventDefault();
		
		var email = $("#email").val();
		var password = $("#password").val();
		
		auth.signInWithEmailAndPassword(email, password).then(function(){
			$("#login")[0].reset();
		}).catch(function(err){
			$("#login")[0].reset();
			alert(err.message);
		});
		
	});
	
	
	
	
	
	
	
	//choose image
	$("#add_image").on("click", function(){
		$("#file_input").click();
	});
	
	$("#file_input").on("change", function(){
		var reader = new FileReader();

		reader.onload = function(e){
			$("#preview_image").attr("src", e.target.result);
			$("#preview_image").fadeIn(10);

			//show upload form
			$("#upload_form").css({"display" : "block"});
			//show submit button
			$("#submit_btn").css({"display" : "block"});
			
			imageUrl = e.target.result;
			
			
			//change location hash
			location.hash = "#add-image";
		}

		reader.readAsDataURL($("#file_input").prop("files")[0]);
	});
	
	
	
	
	
	
	//upload form functions
	var imageSize, lastModified, imageType, metadata;
	
	
	$("#upload_form").on("submit", function(e){
		e.preventDefault();
		
		
		
		
		imageSize = $("#file_input").prop("files")[0].size;
		lastModified = $("#file_input").prop("files")[0].lastModified;
		imageType = $("#file_input").prop("files")[0].type;
		
		
		db.collection("images").orderBy("date", "desc").where("imagesize", "==", imageSize).where("lastmodified", "==", lastModified).where("imagetype", "==", imageType).get().then(function(snapshot){
			
			if (snapshot.docs.length <= 0){
				$("#submit_btn").css({"display" : "none"});

				var file = $("#file_input").prop("files")[0];
				var storage = firebase.storage().ref("photos/" + file.name);

				metadata = {
					customMetadata: {
						lastmodified: lastModified,
					}
				}

				var task = storage.put(file, metadata);

				task.on("state_changed", function progress(snapshot){

					$("#upload_status, #upload_percentage").css({"display" : "block"});
					$("#upload_status").css({"width" : ((snapshot.bytesTransferred / snapshot.totalBytes) * 100) + "%"});
					$("#upload_percentage").text(Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100) + "%");

				}, function error(err){

					window.history.back();

				}, function complete(){

					$("#upload_percentage").text("Please Wait..");


					$(
						imageCode
						.split("THUMBNAIL")
						.join(imageUrl)
					).insertAfter("#add_image");


					setTimeout(function(){
						window.history.back();
					}, 2000);

				});
			}
			else {
				alert("Image already exist!");
				window.history.back();
			}
			
		});
		
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	//window hash change function
	$(window).on("hashchange", function(){
		if (location.hash === ""){
			//reset form
			$("#upload_form").fadeOut(200);
			
			//reset form
			imageSize = "";
			lastModified = "";
			imageType = "";
			metadata = "";
			$("#upload_status, #upload_percentage").css({"display" : "none"});
			$("#upload_status").css({"width" : "0%"});
			$("#upload_percentage").text("");
			$("#upload_form")[0].reset();
			
			//hide delete dialog
			$("#delete_dialog").fadeOut(100);
			$("#deleting").css({"display" : "none"});
			
			//hide delete alert
			$("#delete_alert").fadeOut(100);
		}
		else if (location.hash === "#logout"){
			window.history.back();
			auth.signOut();
			
			setTimeout(function(){
				location.reload();
			}, 1000);
		}
		else if (location.hash.indexOf("#id=") > -1){
			
			if (location.hash.indexOf("IMAGEID") > -1){
				$("#delete_alert").fadeIn(100);
			}
			else {
				$("#delete_dialog").fadeIn(100);
			}
			
		}
	});
	
	
	
	
	//delete functions
	$("#ok").on("click", function(){
		window.history.back();
	});
	
	$("#no").on("click", function(){
		window.history.back();
	});

	$("#yes").on("click", function(){
		$("#deleting").fadeIn(100);

		var id = location.hash.split("#id=").join("");

		db.collection("images").doc(id).get().then(function(image){

			var ref = firebase.storage().ref("photos/" + image.data().imagename);
			var thumbRef = firebase.storage().ref("photos/thumb_" + image.data().imagename);

			ref.delete().then(function(){

				thumbRef.delete().then(function(){

					db.collection("images").doc(id).delete().then(function(){
						$("main a").each(function(){
							if ($(this).attr("href") === "#id=" + id){
								$(this).css({"display" : "none"});
							}
						});

						console.log("delete successful");
						window.history.back();
					}).catch(function(err){
						alert(err.message);
						window.history.back();
					});

				}).catch(function(err){
					alert(err.message);
					window.history.back();
				});

			}).catch(function(err){
				alert(err.message);
				window.history.back();
			});

		});

	});
	
});