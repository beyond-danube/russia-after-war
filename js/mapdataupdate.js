function getRandomColorString() {
  let randomColor = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
  return `#${randomColor}`
}

async function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transform: (value) => {
        return value.trim();
      },
      complete: (results) => {
        return resolve(results);
      },
      error: (error) => {
        return reject(error);
      },
    });
  });
}

async function getColoring(){ 

  let colorMapping = []

  dataMapping.data.filter((value, index, self) => {
      return self.findIndex(v => v.id === value.id) === index;
    }).map(element => {
  
      let randomColor = getRandomColorString()
  
      colorMapping.push({ id: element.id, color: randomColor })
  
    }
  )

  let matchExpression = ['match', ['get', 'shapeISO']];

  dataMapping.data.forEach(entry => {
    matchExpression.push(`RU-${entry.code}`, colorMapping.find(x => x.id === entry.id).color)
  })

  matchExpression.push('rgba(0, 0, 0, 0)');

  return matchExpression
}

async function updateDataLayer(){

  popup.remove();

  if(map.getLayer('ukradm-join'))
  {
    map.removeLayer('ukradm-join')
  }


  map.addLayer({
    'id': 'rusadm-join',
    'type': 'fill',
    'source': 'rusadm',
    'source-layer': 'geoBoundaries-RUS-ADM1-bwrk4b',
    'paint': {
      'fill-color': await getColoring(),
      'fill-opacity': 0.7
      }
    }, 'water'
  )
}

function drawPopUp(e){

  let val = countiesData.data.find(x => x.id === dataMapping.data.find(x => `RU-${x.code}` === e.features[0].properties.shapeISO).id).name
  let newCode = countiesData.data.find(x => x.id === dataMapping.data.find(x => `RU-${x.code}` === e.features[0].properties.shapeISO).id).id
  let description = countiesData.data.find(x => x.id === dataMapping.data.find(x => `RU-${x.code}` === e.features[0].properties.shapeISO).id).description

  description = description === undefined ? description = 'Ми поки не знаємо, що там' : description

  popup
    .setLngLat(e.lngLat.wrap())
    .setHTML(`<h3>${val}</h3><p>${description}</p>`)
    .addTo(map);

  console.log(`${val} ${newCode} ${e.features[0].properties.shapeISO.id}`)
};

function showHide(id, infoId = null) {

  let panel = document.getElementById(id);
  let text = document.getElementById(infoId);

  if (panel.style.display === "none"){
    panel.style.display = "block";
    if(text !== null)
    {
      text.innerHTML = text.innerHTML.replace('показати ', 'сховати ');
    }
  } else {
    panel.style.display = "none";
    if(text !== null)
    {
      text.innerHTML = text.innerHTML.replace('сховати ', 'показати ');
    }
  }
}
