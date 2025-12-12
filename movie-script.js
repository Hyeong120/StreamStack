const params = new URLSearchParams(window.location.search);
const ids = params.get("id");

async function loadMovies() {
        const response = await fetch('github.com/Bentelador/StreamStack/raw/refs/heads/main/MDB.json');
        let allMovies = await response.json();
        let Movies = allMovies.filter(n => n.id.includes(ids));
        const buns = document.getElementById('main-content').innerHTML;
        document.getElementById('main-content').innerHTML = ``;
        document.getElementById('main-content').innerHTML = `
        <iframe  class="main-watch" id="main-watch" src="https://vidsrc-embed.ru/embed/movie/${ids}" allow="fullscreen;"></iframe>
            <div class="thumb-desc-container">
                <div class="thumbnail-container">
                    <img class="thumbnail" src="${Movies[0].image}" alt="">
                </div>
                <div class="title-desc">
                    <div class="title"><h1>${Movies[0].title}</div> <br>
                    <div class="desc">"${Movies[0].synopsis}"</div>
                    <div class="li-datas">
                        <ul>
                            <li>Genre: ${Movies[0].genre}</li>
                            <li>Year: ${Movies[0].year}</li>
                            <li>Ratings: ${Movies[0].rating} ⭐</li>
                        </ul>
                    </div>
                </div>                    
            </div>`;

            allMovies = allMovies.filter(obj1 =>
            obj1.genre.some(g1 =>
                Movies.some(obj2 => obj2.genre.includes(g1))
            )
            );
        const maxStartIndex = allMovies.length - 5; // make sure we have 5 elements

        // Generate random start index
        const randomStart = Math.floor(Math.random() * (maxStartIndex + 1));
        
        // Slice 5 elements starting from the random index
        allMovies = allMovies.slice(randomStart, randomStart + 5);
            allMovies.forEach(element => {
                document.getElementById('watch-more-rows').innerHTML = document.getElementById('watch-more-rows').innerHTML + `
                <div class="netflix-movie-card">
                    <img class="netflix-movie-poster" src="${element.image}"></img>
                    <div class="netflix-movie-title">${element.title}</div>
                    <div class="netflix-movie-actions">
                        <div class="netflix-action-row">
                            <div class="netflix-main-actions">
                                <button class="netflix-play-btn" onclick="playMovie('${element.id}')">▶</button>

                            </div>
                            <button class="netflix-info-btn" onclick="showMovieInfo('${element.id}')">ℹ</button>
                        </div>
                        <div class="netflix-movie-info">
                            <div class="netflix-movie-match">${element.rating * 10}%</div>
                            <div class="netflix-movie-genres">${element.genre}</div>
                            <span class="netflix-hd-badge">HD</span>
                        </div>
                    </div>
                </div>
            </div>`;
            });
    allMovies = null;
    Movies = null;
}
loadMovies();

document.getElementById('homebtn').addEventListener('click',function(){
        window.location.href = "main-movie-page.html"
});






















