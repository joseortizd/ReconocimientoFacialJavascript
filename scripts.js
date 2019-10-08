const imageUploaded = document.getElementById('imageUpload')

//Aca se cargan los modelos de faceapi para realizar el reconocimiento en imagenes
Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

// Funcion principal de la aplicacion
async function start() {
    alert('El sitio cargo, esta listo para usarse')
    const container = document.createElement('div')
    container.style.position = 'relative'
    document.body.append(container)
    const labeledFaceDescriptors = await loadLabeledImages()
    // Llamado al metodo para reconocer las imagenes de referencia y se aplica la funcion Facematcher
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    let image
    let canvas
    // Cuando se carga una imagene se ejecuta el siguiente metodo
    imageUpload.addEventListener('change', async () => {
        if (image) image.remove()
        if (canvas) canvas.remove()
        image = await faceapi.bufferToImage(imageUpload.files[0])
        // Se muestra la imagen en la vista
        container.append(image)
        canvas = faceapi.createCanvasFromMedia(image)
        container.append(canvas)
        const displaySize = { width: image.width, height: image.height }
        faceapi.matchDimensions(canvas, displaySize)
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
            // Metodo para escribir el nombre de las personas en la foto.
            if (result.toString().substring(0, result.toString().length - 7).localeCompare("unknown")) {
                if (result.toString().substring(0, result.toString().length - 7).localeCompare("unknow")) {
                    console.log('%'+result.toString().substring(0, result.toString().length - 7) +'%')
                    document.body.append('La persona es: '+(result.toString().substring(0, result.toString().length - 7)))
                }

             }
            drawBox.draw(canvas)
        })
    })
}


// Aca se leen las iagenes de referencia y se identifican
function loadLabeledImages() {
    const labels = ['walter','jesse']
    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            for (let i = 1; i <= 4; i++) {
                const img = await faceapi.fetchImage('/labeled_images/'+label+'/jg'+i+'.jpg')
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                descriptions.push(detections.descriptor)
            }

            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}
