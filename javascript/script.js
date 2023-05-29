var db = openDatabase('musics', '1.0', 'My first data', 2 * 1024 * 1024);

db.transaction(function(tx){
  tx.executeSql('CREATE TABLE waitList(ID_song INTEGER, title TEXT, artist TEXT, userName TEXT)');
});

// dark mode
const body = document.querySelector('.body');
const icon = document.querySelector('.icon');

icon.addEventListener('click', () => {
    body.classList.toggle('dark');
});

// menu option
document.getElementById("navMenu").addEventListener("click", function() {
    // Toggle active class on menu icon
    this.classList.toggle("active");
    
    // Toggle display property on menu items
    var menuItems = document.getElementById("menuItems");
    if (menuItems.style.display === "inline") {
      menuItems.style.display = "none";
    } else {
      menuItems.style.display = "inline";
      
    }
  });

  // Show the playlist by selection
  function showTab(tabName){
    // hide all tabs
    var tabs = document.getElementsByClassName("myPlaylist");
    for(var i = 0; i < tabs.length; i++){
      tabs[i].style.display = "none";
    }
    // Show selected tab
    document.getElementById(tabName).style.display = "block";
    document.getElementById("songList").style.display = "none";
  }

  // show the first tab by default
  showTab("playlist");

  const menuItems = document.querySelectorAll('.menu-Item');

  menuItems.forEach(item => {
    item.addEventListener('click', function() {
      // Remove the "selected" class from all menu items
      menuItems.forEach(item => {
        item.classList.remove('selected');
      });
      // Add the "selected" class to the clicked menu item
      item.classList.add('selected');
    });
  });

  // insert the song on the database
  function addToWaitingList(id, title, artist, userName) {
    db.transaction(function (tx) {
      tx.executeSql(
        'SELECT * FROM waitList WHERE ID_song = ? And userName = ?',
        [id, userName],
        function (tx, results) {
          if (results.rows.length == 0) {
            tx.executeSql(
              'INSERT INTO waitList (ID_song, title, artist, userName) VALUES (?, ?, ?, ?)',
              [id, title, artist, userName],
              
            );
           } 
        },
      );
    });
  }
  
  
  function getWaitingListFromPage() {
      var waitingList = [];
      var trs = document.querySelectorAll("#waitingList tr");
      for (var i = 1; i < trs.length; i++) {
          var tr = trs[i];
          var id = tr.getAttribute("data-id");
          var title = tr.cells[1].textContent;
          var artist = tr.cells[2].textContent;
          waitingList.push({ id: id, title: title, artist: artist });
      }
      return waitingList;
  }
  
  function removeFromWaitingList(id, userName) {
    // Find waitlist item with matching ID
    var table = document.getElementById("waitingList");
    var rows = Array.from(table.getElementsByTagName("tr"));
    for (var i = 0; i < rows.length; i++) {
    if (rows[i].getAttribute("data-id") == id &&  rows[i].getAttribute("data-userName") == userName) {
    // Add call to function that deletes music from database
    deleteSongFromDatabase(id, userName);
    table.removeChild(rows[i]);
    break;
    }
    }

    // Show empty lists message if list is empty
    if (table.getElementsByTagName("tr").length === 1) {
    var emptyMessage = document.getElementById("emptyMessage");
    emptyMessage.style.display = "block";
    var listDiv = document.getElementById("list");
    listDiv.style.display = "none";
    }
    
    // Save waitlist in sqlite
    var waitingList = getWaitingListFromPage();
    
   }
   
   // function to check and delete only the song that user want to delete if have 2 songs with the same id on the list.
   function deleteSongFromDatabase(id, userName) {
    db.transaction(function (tx) {
    tx.executeSql('DELETE FROM waitList WHERE ID_song = ? AND userName = ?', [id, userName], function(tx, results) {
    });
    });
    
   }
   
// function to not duplicate the list if the user click mutiplo times on the playlist
function resetSongList() {
  isSongListLoaded = false;
  var list = document.getElementById("songList");
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }
}

// Function to show the songs by the album like if i want to see all the songs that is from the beatles 
function showAlbum(lists) {
  resetSongList();
  
  document.getElementById("album").style.display = "none";
  document.getElementById("songList").style.display = "flex";
  
  // Start loading the album list..
  
  // loading the XML file.
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // Looking for the ablum that is passed on lists parameter
      var xmlDoc = this.responseXML;
      var songs = xmlDoc.getElementsByTagName("song");
      var albumSongs = [];
      for (var i = 0; i < songs.length; i++) {
        var album = songs[i].getElementsByTagName("artist")[0].childNodes[0].nodeValue;
        if (album === lists) {
          albumSongs.push(songs[i]);
          // console.log(albumSongs);
        }
      }
      if (albumSongs.length === 0) {
        var list = document.getElementById("songList");
        var p = document.createElement("p");
        p.innerHTML = "No music found";
        list.appendChild(p);
        return;
      }
      
      var list = document.getElementById("songList");
      
      // Display each song in a table row
      for (var i = 0; i < albumSongs.length; i++) {
        var title = albumSongs[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
        var id = albumSongs[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
        var artist = albumSongs[i].getElementsByTagName("artist")[0].childNodes[0].nodeValue;
        var imgSrc = albumSongs[i].getElementsByTagName("image")[0].childNodes[0].nodeValue;
        
        var li = document.createElement("li");
        li.innerHTML = "<img src='" + imgSrc + "' alt='Imagem do CD'>" +
          "<div class='songInfo'>" +
          "<br> "+
          "<h2>" + title + "</h2>" +
          "<p>" + id + "</p>" +
          "<p>" + artist + "</p>" + 
          "<button class='redBackground' onclick='showUserNameInput(this, \"" + id + "\", \"" + title + "\", \"" + artist + "\")'>+</button>" +
          "</div>";
        list.appendChild(li);
            
      }
    }
  };
  xhttp.open("GET", "xml/karaoke.xml", true);
  xhttp.send();
}

// function to show songs if the user press on the lists like international sogs
function showSongs(lists) {
  resetSongList();

  document.getElementById("playlist").style.display = "none";
	document.getElementById("songList").style.display = "flex";
  
  // Loading XML File
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // Find all songs in the selected playlist
      var xmlDoc = this.responseXML;
      var musics = xmlDoc.getElementsByTagName("musics");
      var internationalSongs = [];

      for (var i = 0; i < musics.length; i++) {
        if (musics[i].getAttribute("name") === lists) {
          var songs = musics[i].getElementsByTagName("song");
          for (var j = 0; j < songs.length; j++) {
            internationalSongs.push(songs[j]);
          }
        }else{
          var songs = musics[i].getElementsByTagName("song");
          for (var j = 0; j < songs.length; j++){
            var genre = songs[j].getElementsByTagName("genre")[0].childNodes[0].nodeValue;
            if (genre === lists){
              internationalSongs.push(songs[j]);
            }
          }
          
        }
      }
      
      if (internationalSongs.length === 0) {
        var list = document.getElementById("songList");
        var h1 = document.createElement("h1");
        h1.className = "coming-soon";
        h1.innerHTML = "No matching songs found.";
        list.appendChild(h1);
        // console.log("No matching songs found in the XML file.");
        return;
      }
      
      var list = document.getElementById("songList");
      
      // Display each song in a table row
      for (var i = 0; i < internationalSongs.length; i++) {
        var title = internationalSongs[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
        var id = internationalSongs[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
        var artist = internationalSongs[i].getElementsByTagName("artist")[0].childNodes[0].nodeValue;
        var imgSrc = internationalSongs[i].getElementsByTagName("image")[0].childNodes[0].nodeValue;
        
        var li = document.createElement("li");
        li.innerHTML = "<img src='" + imgSrc + "' alt='Imagem do CD'>" +
                       "<div class='songInfo'>" +
                       "<br> "+
                       "<h2>" + title + "</h2>" +
                       "<p>" + id + "</p>" +
                       "<p>" + artist + "</p>" + 
                       "<button class='redBackground' onclick='showUserNameInput(this, \"" + id + "\", \"" + title + "\", \"" + artist + "\")'>+</button>" +
               "</div>";
        list.appendChild(li);
        
      }
    }
  };
  xhttp.open("GET", "xml/karaoke.xml", true);
  xhttp.send();
}

// Get references to the form elements
var form = document.querySelector(".input-holder");
var input = form.querySelector("input[name='search']");

// Handle form submission
form.addEventListener("submit", function (event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the search query from the input element
    var searchQuery = input.value;

     // Capitalize the first letter of the search query
     searchQuery = searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1);

    // Perform the search
    searchSongs(searchQuery, searchQuery, searchQuery);
});

// Function to show the song that the user research on the search bar
function searchSongs(searchId, searchBand, searchName) {
    resetSongList();

    document.getElementById("playlist").style.display = "none";
    document.getElementById("album").style.display = "none";
    document.getElementById("like").style.display = "none";
    document.getElementById("add-to-playlist").style.display = "none";
    document.getElementById("songList").style.display = "flex";

    // Load the XML file
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Find all songs that match the search criteria
            var xmlDoc = this.responseXML;
            var songs = xmlDoc.getElementsByTagName("song");
            var matchingSongs = [];
            for (var i = 0; i < songs.length; i++) {
                var song = songs[i];
                var id = song.getElementsByTagName("id")[0].textContent;
                var artist = song.getElementsByTagName("artist")[0].textContent;
                var title = song.getElementsByTagName("title")[0].textContent;
                // remove case sensitive and signs
                if (id.toLowerCase().replace(/'/g, "") == searchId.toLowerCase().replace(/'/g, "") || artist.toLowerCase().replace(/'/g, "") == searchBand.toLowerCase().replace(/'/g, "") || title.toLowerCase().replace(/'/g, "") == searchName.toLowerCase().replace(/'/g, "")) {
                    matchingSongs.push(song);
                }
            }

            if (matchingSongs.length == 0) {
                var list = document.getElementById("songList");
                var h1 = document.createElement("h1");
                h1.className = "coming-soon";
                h1.innerHTML = "No matching songs found.";
                list.appendChild(h1);
                // console.log("No matching songs found in the XML file.");
                return;
            }

            var list = document.getElementById("songList");

            // Display each matching song in a row of the table
            for (var i = 0; i < matchingSongs.length; i++) {
                var title = matchingSongs[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
                var id = matchingSongs[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
                var artist = matchingSongs[i].getElementsByTagName("artist")[0].childNodes[0].nodeValue;
                var imgSrc = matchingSongs[i].getElementsByTagName("image")[0].childNodes[0].nodeValue;

                var li = document.createElement("li");
                li.innerHTML = "<img src='" + imgSrc + "' alt='Imagem do CD'>" +
                                "<div class='songInfo'>" +
                                "<br> "+
                                "<h2>" + title + "</h2>" +
                                "<p>" + id + "</p>" +
                                "<p>" + artist + "</p>" + 
                                "<button class='redBackground' onclick='showUserNameInput(this, \"" + id + "\", \"" + title + "\", \"" + artist + "\")'>+</button>" +
                    "</div>";
                list.appendChild(li);
            }
        }
    };
    xhttp.open("GET", "xml/karaoke.xml", true);
    xhttp.send();
}

// Get input from the users when the user want to add a song on the list

function showUserNameInput(button, id, title, artist) {
  var songInfoDiv = button.parentNode;
  var userNameInput = songInfoDiv.querySelector("input");
  if (!userNameInput) {
      userNameInput = document.createElement("input");
      userNameInput.type = "text";
      userNameInput.placeholder = "Your Name";
      userNameInput.style.borderRadius = "10px";
      userNameInput.style.margin = "0 0 0 10px"; 
      songInfoDiv.appendChild(userNameInput); 
  } else {
      userNameInput.style.display = "";
  }
  var addButton = document.createElement("button");
  addButton.textContent = "+";
  addButton.style.backgroundColor = 'red';
  addButton.style.borderRadius = '10px';
  addButton.style.color = 'white';
  addButton.style.margin = '5px';
  addButton.addEventListener("click", function() {
    // Check if the input is in blank not add the song 
    if (userNameInput.value.trim() === "") {
      var alertHTML = '<div class="alert alert-dark "style="margin: 0 0 0 10px" role="alert"><strong>Please add your name!</strong></div>';
      addButton.insertAdjacentHTML('afterend', alertHTML);
      var alertElement = addButton.nextElementSibling;
      setTimeout(function() {
        alertElement.remove();
        songInfoDiv.appendChild(originalButton);
      }, 3000);
      return;
    }
    addToWaitingList(id, title, artist, userNameInput.value);
    var alertHTML = '<div class="alert alert-dark "style="margin: 0 0 0 10px" role="alert"><strong>Music added!</strong></div>';
    addButton.insertAdjacentHTML('afterend', alertHTML);
    userNameInput.value = "";
    var alertElement = addButton.nextElementSibling;
    setTimeout(function() {
        alertElement.remove();
        var originalButton = document.createElement("button");
        originalButton.className = 'redBackground';
        originalButton.textContent = "+";
        originalButton.addEventListener("click", function() {
          showUserNameInput(originalButton, id, title, artist);
      });
      songInfoDiv.appendChild(originalButton);
    }, 3000);
      loadWaitingListFromDatabase();
      userNameInput.style.display="none";
      addButton.remove();
        
  });
  songInfoDiv.appendChild(addButton);
  button.remove();

}

//function to delete everything that is on the database
function deleteAll() {

  db.transaction(function (tx) {
    tx.executeSql('DELETE FROM waitList');
    
    loadWaitingListFromDatabase();
  });

}

// Get everything that is save on the database to display on the page in a table
function loadWaitingListFromDatabase() {
 
  db.transaction(function(tx) {
    tx.executeSql('SELECT * FROM waitList', [], function(tx, results) {
      var len = results.rows.length;
      
      
      if (len === 0) {
        // If the waiting list is empty, show the message "empty lists" and hide the waiting lists
        var emptyMessage = document.getElementById("emptyMessage");
        emptyMessage.style.display = "block";
        
        var listDiv = document.getElementById("list");
        listDiv.style.display = "none";
        
      } else {
        // If the waiting list is not empty, hide the "empty lists" message and show the waiting lists
        var emptyMessage = document.getElementById("emptyMessage");
        emptyMessage.style.display = "none";
        var listDiv = document.getElementById("list");
        listDiv.style.display = "block";
  
        var table = document.getElementById("waitingList");
        table.innerHTML = "";

        // Recreate the header row
        var headerRow = document.createElement("tr");
        var headers = ["ID", "Title", "Artist", "UserName", ""];
        for (var i = 0; i < headers.length; i++) {
            var th = document.createElement("th");
            th.textContent = headers[i];
            headerRow.appendChild(th);
        }
        var removeButton = document.createElement("button");
        removeButton.className = "btn btn-primary";
        removeButton.textContent = "Remove all";
        removeButton.addEventListener("click", function() {
            deleteAll();
        });
        headerRow.lastChild.appendChild(removeButton);

        table.appendChild(headerRow);


      }
      
      for (var i = 0; i < len; i++) {
        var row = results.rows.item(i);
        
        // Check if the song is already on the queue list
        var waitingList = getWaitingListFromPage();
        var songAlreadyInList = waitingList.some(function(song) {
          return song.id == row.ID_song && song.userName == row.userName;
        });
        
        if (songAlreadyInList) {
          // The song is already on the queue list, so we don't need to add it again
          continue;
        }
     
        // Create a new table row with the song's title, artist and "Remove" button
        var tr = document.createElement("tr");
        tr.setAttribute("data-id", row.ID_song);
        tr.setAttribute("data-userName", row.userName);

        
        
        var idCell = document.createElement("td");
        idCell.textContent = row.ID_song;
        tr.appendChild(idCell);
        
        var titleCell = document.createElement("td");
        titleCell.textContent = row.title;
        tr.appendChild(titleCell);
        
        var artistCell = document.createElement("td");
        artistCell.textContent = row.artist;
        tr.appendChild(artistCell);
        
        var userNameCell = document.createElement("td");
        userNameCell.textContent = row.userName;
        tr.appendChild(userNameCell);
        
        var removeButton = document.createElement("button");
        removeButton.className = "btn btn-primary";
        removeButton.innerHTML = "Remove";
        removeButton.addEventListener("click", function() {
          var itemId = this.parentNode.parentNode.getAttribute("data-id");
          var userName = this.parentNode.parentNode.getAttribute("data-userName");
          removeFromWaitingList(itemId, userName);
          
          // loadWaitingListFromDatabase();
        });
        var removeCell = document.createElement("td");
        removeCell.appendChild(removeButton);
        tr.appendChild(removeCell);

        // Add the table row to the table
        var table = document.getElementById("waitingList");
        table.appendChild(tr);
        }
        });
        });
        }

// Call the load WaitingList From Database function when the page is loaded
window.addEventListener("load", loadWaitingListFromDatabase);
