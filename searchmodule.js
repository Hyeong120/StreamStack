async function ben(serch, BS, sort){
  let result;
  await fetch('https://raw.githubusercontent.com/Bentelador/movie-bai/refs/heads/main/MDB.json')
    .then(response => response.json())
    .then(jsonData => {
      let aresult = jsonData.filter(n => n.title.toLowerCase().includes(serch));
      result = sorta(sort,aresult,serch)
    })
  return result;
}

function matching(result, ss) {
    const MA = result.toLowerCase()
    const ser = ss.toLowerCase()
    let matches = 0
   if (MA === ser) {
        matches += 3;
    }
    else if (MA.startsWith(ser)) {
        matches += 2;
    }
    else if (MA.includes(ser)) {
        matches += 1;
    }

    return matches;
}

async function sorta(sort,result,ss) {
  let bb;
  if (sort == "year_old") {
        bb = result.sort((yearA,yearB) => {
          return yearA.year - yearB.year;
        })
    }
  if (sort == "year") {
        bb = result.sort((yearA,yearB) => {
          return yearB.year - yearA.year;
        })
    }
  if (sort == "rating") {
        bb = result.sort((A,B) => {
          return B.rating - A.rating;
        })
    }
  if (sort == "title") {
        const alphabeticOnlyRegex = /[^a-zA-Z0-9]/g; 
        bb = result.sort((A,B) => {
          const nameA = A.title.toLowerCase().replace(alphabeticOnlyRegex, "");
          const nameB = B.title.toLowerCase().replace(alphabeticOnlyRegex, "");
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        })
    }
  if (sort == "relevance") {
    bb = result.sort((a,b) => {
      return matching(b.title,ss) - matching(a.title,ss);
    })
  }
  return bb
}

async function searchfunc(serch, BS, sort){
  let result;
  await fetch('https://raw.githubusercontent.com/Bentelador/movie-bai/refs/heads/main/MDB.json')
    .then(response => response.json())
    .then(jsonData => {
      const cont = BS.children
      const arr = []
      for (let i = 0; i < cont.length; i++) {
        if (cont[i].checked == true) {
        arr.push(cont[i].name)
        }
      }
      const res = jsonData.filter(n => arr.every(genreArray => n.genre.includes(genreArray)))
      let aresult = res.filter(n => n.title.toLowerCase().includes(serch))
      result = sorta(sort,aresult,serch)
    })
  return result;
}

export default ben
export { searchfunc }
















































