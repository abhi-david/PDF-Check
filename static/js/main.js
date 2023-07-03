
var submitBtndiffButton = document.getElementById("submitBtndiff");
var submitBtnvalidate = document.getElementById("submitBtnvalidate");
var viewBtn = document.getElementById("viewBtn");
var btncnt = document.getElementById("btn-ctn");
var configuration = {
  drawFileList: true,
  fileListToggle: false,
  fileListStartVisible: false,
  fileContentToggle: false,
  matching: 'lines',
  outputFormat: 'side-by-side',
  synchronisedScroll: true,
  highlight: true,
  renderNothingWhenEmpty: false,
};

if(submitBtndiffButton){
submitBtndiffButton.addEventListener("click", function (event) {

  var targetElement = document.getElementById('myDiffElement');
  // targetElement.style.ins['background-color']="red"
  var configuration = {
    drawFileList: true,
    fileListToggle: true,
    fileListStartVisible: false,
    fileContentToggle: true,
    matching: 'lines',
    outputFormat: 'side-by-side',
    synchronisedScroll: true,
    highlight: true,
    renderNothingWhenEmpty: false,
  };
  
  var form1 = document.getElementById("pdfForm1");
  var form2 = document.getElementById("pdfForm2");

  var formData = new FormData();

  // Append the form data from form1
  loadingSpinner.style.display = "flex";
  // submitBtndiffButton.disabled = true;

  var formData1 = new FormData(form1);
  for (var pair of formData1.entries()) {
    formData.append(pair[0], pair[1]);
  }

  // Append the form data from form2
  var formData2 = new FormData(form2);
  for (var pair of formData2.entries()) {
    formData.append(pair[0], pair[1]);
  }

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/diff"); // Flask server url
  xhr.send(formData);
  var isPDF1, isCorrupted1, isProtected1, isReadable1, isPDF2, isCorrupted2, isProtected2, isReadable2, text1, text2, diffarray;
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      console.log(response)
      isPDF1 = response["isPDF1"];
      isCorrupted1 = response["isCorrupted1"];
      isProtected1 = response["isProtected1"];
      isReadable1 = response["isReadable1"];
      isPDF2 = response["isPDF2"];
      isCorrupted2 = response["isCorrupted2"];
      isProtected2 = response["isProtected2"];
      isReadable2 = response["isReadable2"];
      text1 = response["text1"];
      text2 = response["text2"];
      diffarray = response["diff"];
    }
  }
  xhr.onload = function () {
    
    loadingSpinner.style.display = "none";

  if(isPDF1  &&  isPDF2 && !isCorrupted1 && !isCorrupted2 && isReadable1 && isReadable2){

   
    if(diffarray.length==0){
      card_id_ele=document.getElementById('cardno1d');
      show_cardd.style.display = "block";
      card_id_ele.innerHTML = "Found No Difference";
      targetElement.style.display = "none";
      
    }
    else{
      card_id_ele=document.getElementById('cardno1d');
      show_cardd.style.display = "block";
      card_id_ele.innerHTML = "Found Difference";
      var diff2htmlUi = new Diff2HtmlUI(targetElement, diffarray, configuration);
      diff2htmlUi.draw();
      diff2htmlUi.highlightCode();
      targetElement.style.display = "block";
    }
  }
  else{
    console.log("Not a valid PDF");
    card_id_ele=document.getElementById('cardno1d');
    show_cardd.style.display = "block";
    card_id_ele.innerHTML = "Not a Valid PDF";
    targetElement.style.display = "none";
    
  }
  if (isPDF1 && isPDF2) {
    var step1 = document.getElementById("step1");
    step1.classList.add('active');
    document.getElementById('step1Content').innerHTML = "Uploaded files are PDFs";
  } else {
    var step1 = document.getElementById("step1");
    if (step1.classList.contains('active')) {
      step1.classList.remove('active');
    }
    document.getElementById('step1Content').innerHTML = "Uploaded files are not PDFs";
  }
  if (isCorrupted1 && isCorrupted2) {
    var step2 = document.getElementById("step2");
    if (step2.classList.contains('active')) {
      step2.classList.remove('active');
    }
    document.getElementById('step2Content').innerHTML = "Uploaded files are corrupted";
  } else {
    var step2 = document.getElementById("step2");
    step2.classList.add('active');
    document.getElementById('step2Content').innerHTML = "Uploaded files are not corrupted";
  }
  if (isProtected1 && isProtected2) {
    var step3 = document.getElementById("step3");
    if (step3.classList.contains('active')) {
      step3.classList.remove('active');
    }
    document.getElementById('step3Content').innerHTML = "Uploaded files are protected";
  } else {
    var step3 = document.getElementById("step3");
    step3.classList.add('active');
    document.getElementById('step3Content').innerHTML = "Uploaded files are not protected";
  }
  if (isReadable1 && isReadable2) {
    var step4 = document.getElementById("step4");
    step4.classList.add('active');
    document.getElementById('step4Content').innerHTML = "Uploaded files are readable";
  } else {
    var step4 = document.getElementById("step4");
    if (step4.classList.contains('active')) {
      step4.classList.remove('active');
    }
    document.getElementById('step4Content').innerHTML = "Uploaded files are not readable";
  }
  timelineList.style.display = "block";
  }

});
}
if (submitBtnvalidate) {
  submitBtnvalidate.addEventListener("click", function (event) {
    event.preventDefault();
    var form = document.getElementById("pdfForm");
    var formData = new FormData(form);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:9000/validate");  // Flask server url
    xhr.send(formData);

    var loadingSpinner = document.getElementById("loadingSpinner");
    var timelineList = document.getElementById("timelineListd");

    if (timelineList.style.display !== "none") {
      timelineList.style.display = "none";
    }

    loadingSpinner.style.display = "flex";
    submitBtnvalidate.disabled = true;

    var timelineList = document.getElementById("timelineListd");
    var isPDF, isCorrupted, isProtected, isReadable;
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        console.log(JSON.parse(xhr.responseText));
        isPDF = response["isPDF"];
        isCorrupted = response["isCorrupted"];
        isProtected = response["isProtected"];
        isReadable = response["isReadable"];
        text = response["text"];
      }
    }
    // After the request is completed, display the results
    xhr.onload = function () {
      loadingSpinner.style.display = "none";
      submitBtnvalidate.disabled = false;

      if (isPDF) {
        var step1 = document.getElementById("step1d");
        step1.classList.add('active');
        document.getElementById('step1Contentd').innerHTML = "Uploaded file is a PDF";
      } else {
        var step1 = document.getElementById("step1d");
        if (step1.classList.contains('active')) {
          step1.classList.remove('active');
        }
        document.getElementById('step1Contentd').innerHTML = "Uploaded file is not a PDF";
      }
      if (isCorrupted) {
        var step2 = document.getElementById("step2d");
        if (step2.classList.contains('active')) {
          step2.classList.remove('active');
        }
        document.getElementById('step2Contentd').innerHTML = "Uploaded file is corrupted";
      } else {
        var step2 = document.getElementById("step2d");
        step2.classList.add('active');
        document.getElementById('step2Contentd').innerHTML = "Uploaded file is not corrupted";
      }
      if (isProtected) {
        var step3 = document.getElementById("step3d");
        if (step3.classList.contains('active')) {
          step3.classList.remove('active');
        }
        document.getElementById('step3Contentd').innerHTML = "Uploaded file is protected";
      } else {
        var step3 = document.getElementById("step3d");
        step3.classList.add('active');
        document.getElementById('step3Contentd').innerHTML = "Uploaded file is not protected";
      }
      if (isReadable) {
        var step4 = document.getElementById("step4d");
        step4.classList.add('active');
        document.getElementById('step4Contentd').innerHTML = "Uploaded file is readable";
      } else {
        var step4 = document.getElementById("step4d");
        if (step4.classList.contains('active')) {
          step4.classList.remove('active');
        }
        document.getElementById('step4Contentd').innerHTML = "Uploaded file is not readable";
      }

      timelineList.style.display = "block";
      var outputElement1 = document.getElementById("cardno1d");
      outputElement1.innerHTML = "";

      
        outputElement1.innerText += text;

    }
    btncnt.style.display = "flex";
  })
}

if (viewBtn) {
  viewBtn.addEventListener("click", function () {
    // Get the card element
    var card = document.getElementById("show_cardd");

    // Show the card by changing its display style
    card.style.display = "flex";

  });
}




var submitBtnvjson = document.getElementById("submitBtnjson");



if(submitBtnvjson){
  submitBtnvjson.addEventListener("click", function (event) {
    
    var form1 = document.getElementById("jsonForm1");
      var form2 = document.getElementById("jsonForm2");
      var formData = new FormData();
    var formData1 = new FormData(form1);

      for (var pair of formData1.entries()) {
        formData.append(pair[0], pair[1]);
      }
      var formData2 = new FormData(form2);
      for (var pair of formData2.entries()) {
        formData.append(pair[0], pair[1]);
      }
      loadingSpinnerjson.style.display = "flex";
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/diffjson"); // Flask server url
      xhr.send(formData);
      var diffarray;
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          var response = JSON.parse(xhr.responseText);
          console.log(response);
          diffarray = response["diff"];
        }
      }
      xhr.onload = function () {
        var targetElement = document.getElementById('myDiffElementJSON');
        var configuration = {
          drawFileList: true,
          fileListToggle: false,
          fileListStartVisible: false,
          fileContentToggle: false,
          matching: 'lines',
          outputFormat: 'side-by-side',
          synchronisedScroll: true,
          highlight: true,
          renderNothingWhenEmpty: false,
        };
        loadingSpinnerjson.style.display = "none";
        if(diffarray.length==0){
          card_id_ele=document.getElementById('cardno1d');
          show_cardd.style.display = "block";
          card_id_ele.innerHTML = "Found No Difference";
          targetElement.style.display = "none";
          
        }
        else{
          card_id_ele=document.getElementById('cardno1d');
          show_cardd.style.display = "block";
          card_id_ele.innerHTML = "Found Difference";
          var diff2htmlUi = new Diff2HtmlUI(targetElement, diffarray, configuration);
          diff2htmlUi.draw();
          diff2htmlUi.highlightCode();
          targetElement.style.display = "block";
        }
  
   
      }
  
  
  
  
  });}