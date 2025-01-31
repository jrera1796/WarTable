const uploadButton = document.getElementById("uploadButton");
const gridWidthInput = document.getElementById("gridWidth");
const gridHeightInput = document.getElementById("gridHeight");
const generateGridButton = document.getElementById("generateGridButton");
const container = document.getElementById("container");

// Initialize Konva Stage
const stage = new Konva.Stage({
    container: "container",
    width: window.innerWidth,
    height: window.innerHeight,
});

const mapLayer = new Konva.Layer();
const gridLayer = new Konva.Layer();
stage.add(mapLayer);
stage.add(gridLayer);

let mapImage = null;

// Handle Map Upload
uploadButton.addEventListener("click", async () => {
    try {
        const filePath = await window.electronAPI.uploadMap();
        if (!filePath) {
            console.error("No file selected.");
            return;
        }
        console.log(`File selected: ${filePath}`);

        Konva.Image.fromURL(`file://${filePath}`, (image) => {
            mapLayer.destroyChildren();
            image.setAttrs({
                width: stage.width(),
                height: stage.height(),
            });

            mapLayer.add(image);
            mapLayer.draw();
            mapImage = image;
        });
    } catch (error) {
        console.error("Error during file upload:", error);
    }
});

// Generate Grid
generateGridButton.addEventListener("click", () => {
    const gridWidth = parseInt(gridWidthInput.value, 10);
    const gridHeight = parseInt(gridHeightInput.value, 10);

    if (isNaN(gridWidth) || isNaN(gridHeight) || gridWidth <= 0 || gridHeight <= 0) {
        alert("Please enter valid grid dimensions.");
        return;
    }

    gridLayer.destroyChildren();
    const tileWidth = stage.width() / gridWidth;
    const tileHeight = stage.height() / gridHeight;

    for (let i = 0; i <= gridWidth; i++) {
        gridLayer.add(new Konva.Line({
            points: [i * tileWidth, 0, i * tileWidth, stage.height()],
            stroke: "rgba(0, 0, 0, 0.2)",
            strokeWidth: 1,
        }));
    }

    for (let j = 0; j <= gridHeight; j++) {
        gridLayer.add(new Konva.Line({
            points: [0, j * tileHeight, stage.width(), j * tileHeight],
            stroke: "rgba(0, 0, 0, 0.2)",
            strokeWidth: 1,
        }));
    }

    gridLayer.draw();
});

// Handle Window Resize
window.addEventListener("resize", () => {
    stage.width(window.innerWidth);
    stage.height(window.innerHeight);

    if (mapImage) {
        mapImage.width(stage.width());
        mapImage.height(stage.height());
        mapLayer.draw();
    }

    generateGridButton.click();
});
