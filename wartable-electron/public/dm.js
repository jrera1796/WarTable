const uploadButton = document.getElementById("uploadButton");
const gridWidthInput = document.getElementById("gridWidth");
const gridHeightInput = document.getElementById("gridHeight");
const generateGridButton = document.getElementById("generateGridButton");
const mapContainer = document.getElementById("map-container");

// Initialize Konva Stage
const stage = new Konva.Stage({
    container: "map-container",
    width: mapContainer.clientWidth,
    height: mapContainer.clientHeight,
    draggable: true,
});

// Layers for map and grid
const mapLayer = new Konva.Layer();
const gridLayer = new Konva.Layer();
stage.add(mapLayer);
stage.add(gridLayer);

let mapImage = null; // Reference for the map image
let gridWidth = 0; // Current grid width
let gridHeight = 0; // Current grid height
let MIN_SCALE = 0.5; // Minimum zoom scale (adjusted dynamically)
const MAX_SCALE = 4; // Maximum zoom scale

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
            mapLayer.destroyChildren(); // Clear any existing images
            gridLayer.destroyChildren(); // Clear the grid as well

            image.setAttrs({
                width: stage.width(), // Scale image to fit container width
                height: (stage.width() / image.width()) * image.height(), // Maintain aspect ratio
                draggable: false, // Map itself doesn't move
            });

            mapLayer.add(image);
            mapLayer.draw();
            mapImage = image;

            // Dynamically calculate the minimum scale
            const containerWidth = mapContainer.clientWidth;
            const containerHeight = mapContainer.clientHeight;
            const mapWidth = image.width();
            const mapHeight = image.height();
            const scaleX = containerWidth / mapWidth;
            const scaleY = containerHeight / mapHeight;
            MIN_SCALE = Math.min(scaleX, scaleY);

            console.log("Updated MIN_SCALE:", MIN_SCALE);

            // Reset the stage scale and position
            stage.scale({ x: MIN_SCALE, y: MIN_SCALE });
            stage.position({ x: 0, y: 0 });
            stage.batchDraw();
        });
    } catch (error) {
        console.error("Error during file upload:", error);
    }
});

// Generate Grid Overlay
generateGridButton.addEventListener("click", () => {
    if (!mapImage) {
        alert("Please upload a map first.");
        return;
    }

    gridWidth = parseInt(gridWidthInput.value, 10);
    gridHeight = parseInt(gridHeightInput.value, 10);

    if (isNaN(gridWidth) || isNaN(gridHeight) || gridWidth <= 0 || gridHeight <= 0) {
        alert("Please enter valid grid dimensions.");
        return;
    }

    // Clear existing grid
    gridLayer.destroyChildren();

    // Grid should scale properly with the map
    const tileWidth = mapImage.width() / gridWidth;
    const tileHeight = mapImage.height() / gridHeight;

    // Create vertical lines
    for (let i = 0; i <= gridWidth; i++) {
        const line = new Konva.Line({
            points: [i * tileWidth, 0, i * tileWidth, mapImage.height()],
            stroke: "rgba(0, 0, 0, 0.3)",
            strokeWidth: 1,
        });
        gridLayer.add(line); // Add to gridLayer
    }

    // Create horizontal lines
    for (let j = 0; j <= gridHeight; j++) {
        const line = new Konva.Line({
            points: [0, j * tileHeight, mapImage.width(), j * tileHeight],
            stroke: "rgba(0, 0, 0, 0.3)",
            strokeWidth: 1,
        });
        gridLayer.add(line); // Add to gridLayer
    }

    // Render the grid layer
    gridLayer.batchDraw();
});

// Handle Zoom with Anchoring and Limits
stage.on("wheel", (e) => {
    e.evt.preventDefault();

    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    // Calculate new scale
    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    // Clamp zoom levels
    newScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));
    stage.scale({ x: newScale, y: newScale });

    if (newScale === MIN_SCALE) {
        stage.position({ x: 0, y: 0 });
    } else {
        const newPos = {
            x: pointer.x - (pointer.x - stage.x()) * (newScale / oldScale),
            y: pointer.y - (pointer.y - stage.y()) * (newScale / oldScale),
        };
        stage.position(newPos);
    }

    stage.batchDraw();
});

// Prevent Panning Outside Map Bounds
stage.on("dragmove", () => {
    if (!mapImage) return;

    const scale = stage.scaleX(); // Current zoom scale
    const containerWidth = mapContainer.clientWidth;
    const containerHeight = mapContainer.clientHeight;
    const mapWidth = mapImage.width() * scale;
    const mapHeight = mapImage.height() * scale;

    // Calculate bounds
    const xMin = Math.min(0, containerWidth - mapWidth);
    const xMax = 0;
    const yMin = Math.min(0, containerHeight - mapHeight);
    const yMax = 0;

    // Constrain the position of the stage
    const stageX = Math.max(xMin, Math.min(stage.x(), xMax));
    const stageY = Math.max(yMin, Math.min(stage.y(), yMax));
    stage.position({ x: stageX, y: stageY });
    stage.batchDraw();
});

// Adjust grid scaling dynamically on zoom/pan
stage.on("scale change position change", () => {
    if (!mapImage || gridWidth <= 0 || gridHeight <= 0) return;

    gridLayer.destroyChildren();

    const scale = stage.scaleX();
    const tileWidth = (mapImage.width() * scale) / gridWidth;
    const tileHeight = (mapImage.height() * scale) / gridHeight;

    for (let i = 0; i <= gridWidth; i++) {
        gridLayer.add(new Konva.Line({
            points: [i * tileWidth, 0, i * tileWidth, mapImage.height() * scale],
            stroke: "rgba(0, 0, 0, 0.3)",
            strokeWidth: 1,
        }));
    }
    for (let j = 0; j <= gridHeight; j++) {
        gridLayer.add(new Konva.Line({
            points: [0, j * tileHeight, mapImage.width() * scale, j * tileHeight],
            stroke: "rgba(0, 0, 0, 0.3)",
            strokeWidth: 1,
        }));
    }

    gridLayer.batchDraw();
});

// Handle Window Resize
window.addEventListener("resize", () => {
    stage.width(mapContainer.clientWidth);
    stage.height(mapContainer.clientHeight);

    if (mapImage) {
        stage.scale({ x: MIN_SCALE, y: MIN_SCALE });
        stage.position({ x: 0, y: 0 });
        mapLayer.draw();
    }

    generateGridButton.click(); // Redraw grid to fit new size
});
