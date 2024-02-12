import {AddBlock}               from '@babylonjs/core/Materials/Node/Blocks/addBlock';
import {ArcTan2Block}           from '@babylonjs/core/Materials/Node/Blocks/arcTan2Block';
import {AnimatedInputBlockTypes}    from '@babylonjs/core/Materials/Node/Blocks/Input/animatedInputBlockTypes';
import {ClampBlock}             from '@babylonjs/core/Materials/Node/Blocks/clampBlock';
import {InputBlock}             from '@babylonjs/core/Materials/Node/Blocks/Input/inputBlock';
import {LerpBlock}              from '@babylonjs/core/Materials/Node/Blocks/lerpBlock';
import {MultiplyBlock}          from '@babylonjs/core/Materials/Node/Blocks/multiplyBlock';
import {DotBlock}               from '@babylonjs/core/Materials/Node/Blocks/dotBlock';
import {NodeMaterial}           from '@babylonjs/core/Materials/Node/nodeMaterial';
import {VertexOutputBlock}      from '@babylonjs/core/Materials/Node/Blocks/Vertex/vertexOutputBlock';
import {RemapBlock}             from '@babylonjs/core/Materials/Node/Blocks/remapBlock';
import {ScaleBlock}             from '@babylonjs/core/Materials/Node/Blocks/scaleBlock';
import {OneMinusBlock}          from '@babylonjs/core/Materials/Node/Blocks/oneMinusBlock';
import {StepBlock}              from '@babylonjs/core/Materials/Node/Blocks/stepBlock';
import {VectorMergerBlock}      from '@babylonjs/core/Materials/Node/Blocks/vectorMergerBlock';
import {TextureBlock}           from '@babylonjs/core/Materials/Node/Blocks/Dual/textureBlock';
import {DivideBlock}            from '@babylonjs/core/Materials/Node/Blocks/divideBlock';
import {TransformBlock}         from '@babylonjs/core/Materials/Node/Blocks/transformBlock';
import {NodeMaterialModes}      from '@babylonjs/core/Materials/Node/Enums/nodeMaterialModes';
import {FragmentOutputBlock}    from '@babylonjs/core/Materials/Node/Blocks/Fragment/fragmentOutputBlock';
import {GradientBlock}          from '@babylonjs/core/Materials/Node/Blocks/gradientBlock';
import {GradientBlockColorStep} from '@babylonjs/core/Materials/Node/Blocks/gradientBlock';
import {VectorSplitterBlock}    from '@babylonjs/core/Materials/Node/Blocks/vectorSplitterBlock';
import {TrigonometryBlock}      from '@babylonjs/core/Materials/Node/Blocks/trigonometryBlock';
import {NodeMaterialSystemValues}   from '@babylonjs/core/Materials/Node/Enums/nodeMaterialSystemValues';
import {TrigonometryBlockOperations}    from '@babylonjs/core/Materials/Node/Blocks/trigonometryBlock';
import {Texture}                from '@babylonjs/core/Materials/Textures/texture';
import {Vector2}                from '@babylonjs/core/Maths/math.vector';
import {Color3}                 from '@babylonjs/core/Maths/math.color';
import type {Scene}             from '@babylonjs/core/scene';

export const PlaceMaterial = (scene: Scene):NodeMaterial=> {
	const nodeMaterial = new NodeMaterial("PlaceMaterial", scene);
	nodeMaterial.mode = NodeMaterialModes.Material;

// InputBlock
	const position = new InputBlock("position");
	position.visibleInInspector = false;
	position.visibleOnFrame = false;
	position.target = 1;
	position.setAsAttribute("position");

// TransformBlock
	const WorldPos = new TransformBlock("WorldPos");
	WorldPos.visibleInInspector = false;
	WorldPos.visibleOnFrame = false;
	WorldPos.target = 1;
	WorldPos.complementZ = 0;
	WorldPos.complementW = 1;

// InputBlock
	const World = new InputBlock("World");
	World.visibleInInspector = false;
	World.visibleOnFrame = false;
	World.target = 1;
	World.setAsSystemValue(NodeMaterialSystemValues.World);

// TransformBlock
	const WorldPosViewProjectionTransform = new TransformBlock("WorldPos * ViewProjectionTransform");
	WorldPosViewProjectionTransform.visibleInInspector = false;
	WorldPosViewProjectionTransform.visibleOnFrame = false;
	WorldPosViewProjectionTransform.target = 1;
	WorldPosViewProjectionTransform.complementZ = 0;
	WorldPosViewProjectionTransform.complementW = 1;

// InputBlock
	const ViewProjection = new InputBlock("ViewProjection");
	ViewProjection.visibleInInspector = false;
	ViewProjection.visibleOnFrame = false;
	ViewProjection.target = 1;
	ViewProjection.setAsSystemValue(NodeMaterialSystemValues.ViewProjection);

// VertexOutputBlock
	const VertexOutput = new VertexOutputBlock("VertexOutput");
	VertexOutput.visibleInInspector = false;
	VertexOutput.visibleOnFrame = false;
	VertexOutput.target = 1;

// InputBlock
	const ARROW_COLOR = new InputBlock("ARROW_COLOR");
	ARROW_COLOR.visibleInInspector = false;
	ARROW_COLOR.visibleOnFrame = false;
	ARROW_COLOR.target = 1;
	ARROW_COLOR.value = new Color3(0.7254901960784313, 0.7254901960784313, 0.7254901960784313);
	ARROW_COLOR.isConstant = false;

// LerpBlock
	const Lerp = new LerpBlock("Lerp");
	Lerp.visibleInInspector = false;
	Lerp.visibleOnFrame = false;
	Lerp.target = 4;

// InputBlock
	const BORDERS_COLOR = new InputBlock("BORDERS_COLOR");
	BORDERS_COLOR.visibleInInspector = false;
	BORDERS_COLOR.visibleOnFrame = false;
	BORDERS_COLOR.target = 1;
	BORDERS_COLOR.value = new Color3(0.5019607843137255, 0.5019607843137255, 0.5019607843137255);
	BORDERS_COLOR.isConstant = false;

// StepBlock
	const Step = new StepBlock("Step");
	Step.visibleInInspector = false;
	Step.visibleOnFrame = false;
	Step.target = 4;

// VectorSplitterBlock
	const VectorSplitter = new VectorSplitterBlock("VectorSplitter");
	VectorSplitter.visibleInInspector = false;
	VectorSplitter.visibleOnFrame = false;
	VectorSplitter.target = 4;

// VectorMergerBlock
	const VectorMerger = new VectorMergerBlock("VectorMerger");
	VectorMerger.visibleInInspector = false;
	VectorMerger.visibleOnFrame = false;
	VectorMerger.target = 2;
	VectorMerger.xSwizzle = "x";
	VectorMerger.ySwizzle = "y";
	VectorMerger.zSwizzle = "z";
	VectorMerger.wSwizzle = "w";

// ScaleBlock
	const Scale = new ScaleBlock("Scale");
	Scale.visibleInInspector = false;
	Scale.visibleOnFrame = false;
	Scale.target = 4;

// TrigonometryBlock
	const Sqrt = new TrigonometryBlock("Sqrt");
	Sqrt.visibleInInspector = false;
	Sqrt.visibleOnFrame = false;
	Sqrt.target = 4;
	Sqrt.operation = TrigonometryBlockOperations.Sqrt;

// DotBlock
	const Dot = new DotBlock("Dot");
	Dot.visibleInInspector = false;
	Dot.visibleOnFrame = false;
	Dot.target = 4;

// VectorSplitterBlock
	const VectorSplitter1 = new VectorSplitterBlock("VectorSplitter");
	VectorSplitter1.visibleInInspector = false;
	VectorSplitter1.visibleOnFrame = false;
	VectorSplitter1.target = 4;

// AddBlock
	const Add = new AddBlock("Add");
	Add.visibleInInspector = false;
	Add.visibleOnFrame = false;
	Add.target = 4;

// InputBlock
	const uv = new InputBlock("uv");
	uv.visibleInInspector = false;
	uv.visibleOnFrame = false;
	uv.target = 1;
	uv.setAsAttribute("uv");

// InputBlock
	const Vector = new InputBlock("Vector2");
	Vector.visibleInInspector = false;
	Vector.visibleOnFrame = false;
	Vector.target = 1;
	Vector.value = new Vector2(-0.5, -0.5);
	Vector.isConstant = false;

// ArcTan2Block
	const ArcTan = new ArcTan2Block("ArcTan2");
	ArcTan.visibleInInspector = false;
	ArcTan.visibleOnFrame = false;
	ArcTan.target = 4;

// DivideBlock
	const Divide = new DivideBlock("Divide");
	Divide.visibleInInspector = false;
	Divide.visibleOnFrame = false;
	Divide.target = 4;

// InputBlock
	const Float = new InputBlock("Float");
	Float.visibleInInspector = false;
	Float.visibleOnFrame = false;
	Float.target = 1;
	Float.value = -3.1415;
	Float.min = 0;
	Float.max = 0;
	Float.isBoolean = false;
	Float.matrixMode = 0;
	Float.animationType = AnimatedInputBlockTypes.None;
	Float.isConstant = false;

// InputBlock
	const Float1 = new InputBlock("Float");
	Float1.visibleInInspector = false;
	Float1.visibleOnFrame = false;
	Float1.target = 1;
	Float1.value = 1;
	Float1.min = 0;
	Float1.max = 1;
	Float1.isBoolean = false;
	Float1.matrixMode = 0;
	Float1.animationType = AnimatedInputBlockTypes.None;
	Float1.isConstant = false;

// GradientBlock
	const Gradient = new GradientBlock("Gradient");
	Gradient.visibleInInspector = false;
	Gradient.visibleOnFrame = false;
	Gradient.target = 4;
	Gradient.colorSteps = [];
	Gradient.colorSteps.push(new GradientBlockColorStep(0, new Color3(0.9803921568627451, 0.9686274509803922, 0.9686274509803922)));
	Gradient.colorSteps.push(new GradientBlockColorStep(0.37, new Color3(0.027450980392156862, 0.00784313725490196, 0.00784313725490196)));

// VectorSplitterBlock
	const VectorSplitter2 = new VectorSplitterBlock("VectorSplitter");
	VectorSplitter2.visibleInInspector = false;
	VectorSplitter2.visibleOnFrame = false;
	VectorSplitter2.target = 4;

// MultiplyBlock
	const Multiply = new MultiplyBlock("Multiply");
	Multiply.visibleInInspector = false;
	Multiply.visibleOnFrame = false;
	Multiply.target = 4;

// ClampBlock
	const Clamp = new ClampBlock("Clamp");
	Clamp.visibleInInspector = false;
	Clamp.visibleOnFrame = false;
	Clamp.target = 4;
	Clamp.minimum = 0;
	Clamp.maximum = 1;

// RemapBlock
	const Remap = new RemapBlock("Remap");
	Remap.visibleInInspector = false;
	Remap.visibleOnFrame = false;
	Remap.target = 4;
	Remap.sourceRange = new Vector2(0, 1);
	Remap.targetRange = new Vector2(0, 1);

// TextureBlock
	const ARROW_TEX = new TextureBlock("ARROW_TEX");
	ARROW_TEX.visibleInInspector = false;
	ARROW_TEX.visibleOnFrame = false;
	ARROW_TEX.target = 2;
	ARROW_TEX.convertToGammaSpace = false;
	ARROW_TEX.convertToLinearSpace = false;
	ARROW_TEX.disableLevelMultiplication = false;
	ARROW_TEX.texture = new Texture("data:octet/stream;base64,UklGRjQRAABXRUJQVlA4WAoAAAAsAAAAfwAAfwAASUNDUKACAAAAAAKgbGNtcwRAAABtbnRyUkdCIFhZWiAH6AAKAAMADAAeABRhY3NwQVBQTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWxjbXMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1kZXNjAAABIAAAAEBjcHJ0AAABYAAAADZ3dHB0AAABmAAAABRjaGFkAAABrAAAACxyWFlaAAAB2AAAABRiWFlaAAAB7AAAABRnWFlaAAACAAAAABRyVFJDAAACFAAAACBnVFJDAAACFAAAACBiVFJDAAACFAAAACBjaHJtAAACNAAAACRkbW5kAAACWAAAACRkbWRkAAACfAAAACRtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACQAAAAcAEcASQBNAFAAIABiAHUAaQBsAHQALQBpAG4AIABzAFIARwBCbWx1YwAAAAAAAAABAAAADGVuVVMAAAAaAAAAHABQAHUAYgBsAGkAYwAgAEQAbwBtAGEAaQBuAABYWVogAAAAAAAA9tYAAQAAAADTLXNmMzIAAAAAAAEMQgAABd7///MlAAAHkwAA/ZD///uh///9ogAAA9wAAMBuWFlaIAAAAAAAAG+gAAA49QAAA5BYWVogAAAAAAAAJJ8AAA+EAAC2xFhZWiAAAAAAAABilwAAt4cAABjZcGFyYQAAAAAAAwAAAAJmZgAA8qcAAA1ZAAAT0AAACltjaHJtAAAAAAADAAAAAKPXAABUfAAATM0AAJmaAAAmZwAAD1xtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAEcASQBNAFBtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJWUDggngAAAPAJAJ0BKoAAgAA+MRSIQqIhIRgEACADBLS3boQ4BYgIwB/gLcAEo4KcA1F6IR7uR/3XiAWoae1iCec1cCVVkefdR5A2mQtLmDdrbAWU6iHqHtNWPIG0xgAA/v+NE7894/SCMDbWkPDy/hL9oJYwN4TpF7/aCy4TQvtZIEOMNvp7Ts/fJ1SQzwpQL4aiza9wcuCGkorYEuJ4M0rIAAAARVhJRtAAAABJSSoACAAAAAoAAAEEAAEAAACAAAAAAQEEAAEAAACAAAAAAgEDAAMAAACGAAAAEgEDAAEAAAABAAAAGgEFAAEAAACMAAAAGwEFAAEAAACUAAAAKAEDAAEAAAACAAAAMQECAA0AAACcAAAAMgECABQAAACqAAAAaYcEAAEAAAC+AAAAAAAAAAgACAAIAEgAAAABAAAASAAAAAEAAABHSU1QIDIuMTAuMzYAADIwMjQ6MTA6MDMgMTM6MzU6MDUAAQABoAMAAQAAAAEAAAAAAAAAWE1QIPAMAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA0LjQuMC1FeGl2MiI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOjg0YjIwNjFmLTUxMzQtNGU0NC1iMmQwLWZjOGM5MDNiMDc4MyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowOWZjZDJjMi05MGJiLTRiNGMtYjgxOC1hZGY2YWVhOTgzYzkiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0YWMyMjM4ZC0wZGMzLTRiMTgtODk3Ni04YWRhZjI0NTY4NDUiIGRjOkZvcm1hdD0iaW1hZ2Uvd2VicCIgR0lNUDpBUEk9IjIuMCIgR0lNUDpQbGF0Zm9ybT0iTGludXgiIEdJTVA6VGltZVN0YW1wPSIxNzI3OTU4OTA2MjE1ODMzIiBHSU1QOlZlcnNpb249IjIuMTAuMzYiIHRpZmY6T3JpZW50YXRpb249IjEiIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0OjEwOjAzVDEzOjM1OjA1KzAxOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNDoxMDowM1QxMzozNTowNSswMTowMCI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDpjaGFuZ2VkPSIvIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmQzMDI0ZDUyLWU1NzUtNDMzNC1hMDkwLTlmYmI4ZjBlZjIwNiIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChMaW51eCkiIHN0RXZ0OndoZW49IjIwMjQtMTAtMDNUMTM6MzU6MDYrMDE6MDAiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw/eHBhY2tldCBlbmQ9InciPz4=", null, false, false, 2);
	ARROW_TEX.texture.wrapU = 1;
	ARROW_TEX.texture.wrapV = 1;
	ARROW_TEX.texture.uAng = 0;
	ARROW_TEX.texture.vAng = 0;
	ARROW_TEX.texture.wAng = 0;
	ARROW_TEX.texture.uOffset = 0;
	ARROW_TEX.texture.vOffset = 0;
	ARROW_TEX.texture.uScale = 1;
	ARROW_TEX.texture.vScale = 1;
	ARROW_TEX.texture.coordinatesMode = 7;

// AddBlock
	const Add1 = new AddBlock("Add");
	Add1.visibleInInspector = false;
	Add1.visibleOnFrame = false;
	Add1.target = 2;

// MultiplyBlock
	const Multiply1 = new MultiplyBlock("Multiply");
	Multiply1.visibleInInspector = false;
	Multiply1.visibleOnFrame = false;
	Multiply1.target = 4;

// OneMinusBlock
	const Oneminus = new OneMinusBlock("One minus");
	Oneminus.visibleInInspector = false;
	Oneminus.visibleOnFrame = false;
	Oneminus.target = 4;

// InputBlock
	const TEX_SCALING = new InputBlock("TEX_SCALING");
	TEX_SCALING.visibleInInspector = false;
	TEX_SCALING.visibleOnFrame = false;
	TEX_SCALING.target = 1;
	TEX_SCALING.value = new Vector2(4, 4);
	TEX_SCALING.isConstant = false;

// VectorMergerBlock
	const VectorMerger1 = new VectorMergerBlock("VectorMerger");
	VectorMerger1.visibleInInspector = false;
	VectorMerger1.visibleOnFrame = false;
	VectorMerger1.target = 4;
	VectorMerger1.xSwizzle = "x";
	VectorMerger1.ySwizzle = "y";
	VectorMerger1.zSwizzle = "z";
	VectorMerger1.wSwizzle = "w";

// ScaleBlock
	const Scale1 = new ScaleBlock("Scale");
	Scale1.visibleInInspector = false;
	Scale1.visibleOnFrame = false;
	Scale1.target = 4;

// InputBlock
	const Time = new InputBlock("Time");
	Time.visibleInInspector = false;
	Time.visibleOnFrame = false;
	Time.target = 1;
	Time.value = 1418.609100001075;
	Time.min = 0;
	Time.max = 0;
	Time.isBoolean = false;
	Time.matrixMode = 0;
	Time.animationType = AnimatedInputBlockTypes.Time;
	Time.isConstant = false;

// InputBlock
	const ANIMATION_SPEED = new InputBlock("ANIMATION_SPEED");
	ANIMATION_SPEED.visibleInInspector = false;
	ANIMATION_SPEED.visibleOnFrame = false;
	ANIMATION_SPEED.target = 1;
	ANIMATION_SPEED.value = 1;
	ANIMATION_SPEED.min = 0;
	ANIMATION_SPEED.max = 0;
	ANIMATION_SPEED.isBoolean = false;
	ANIMATION_SPEED.matrixMode = 0;
	ANIMATION_SPEED.animationType = AnimatedInputBlockTypes.None;
	ANIMATION_SPEED.isConstant = false;

// AddBlock
	const Add2 = new AddBlock("Add");
	Add2.visibleInInspector = false;
	Add2.visibleOnFrame = false;
	Add2.target = 4;

// ClampBlock
	const Clamp1 = new ClampBlock("Clamp");
	Clamp1.visibleInInspector = false;
	Clamp1.visibleOnFrame = false;
	Clamp1.target = 4;
	Clamp1.minimum = 0;
	Clamp1.maximum = 1;

// AddBlock
	const Add3 = new AddBlock("Add");
	Add3.visibleInInspector = false;
	Add3.visibleOnFrame = false;
	Add3.target = 4;

// RemapBlock
	const Remap1 = new RemapBlock("Remap");
	Remap1.visibleInInspector = false;
	Remap1.visibleOnFrame = false;
	Remap1.target = 4;
	Remap1.sourceRange = new Vector2(0, 1);
	Remap1.targetRange = new Vector2(-1, 1);

// InputBlock
	const VISIBILITY = new InputBlock("VISIBILITY");
	VISIBILITY.visibleInInspector = false;
	VISIBILITY.visibleOnFrame = false;
	VISIBILITY.target = 1;
	VISIBILITY.value = 0.5;
	VISIBILITY.min = 0;
	VISIBILITY.max = 1;
	VISIBILITY.isBoolean = false;
	VISIBILITY.matrixMode = 0;
	VISIBILITY.animationType = AnimatedInputBlockTypes.None;
	VISIBILITY.isConstant = false;

// ClampBlock
	const Clamp2 = new ClampBlock("Clamp");
	Clamp2.visibleInInspector = false;
	Clamp2.visibleOnFrame = false;
	Clamp2.target = 4;
	Clamp2.minimum = 0;
	Clamp2.maximum = 1;

// FragmentOutputBlock
	const FragmentOutput = new FragmentOutputBlock("FragmentOutput");
	FragmentOutput.visibleInInspector = false;
	FragmentOutput.visibleOnFrame = false;
	FragmentOutput.target = 2;
	FragmentOutput.convertToGammaSpace = false;
	FragmentOutput.convertToLinearSpace = false;
	FragmentOutput.useLogarithmicDepth = false;

// ScaleBlock
	const Scale2 = new ScaleBlock("Scale");
	Scale2.visibleInInspector = false;
	Scale2.visibleOnFrame = false;
	Scale2.target = 4;

// OneMinusBlock
	const Oneminus1 = new OneMinusBlock("One minus");
	Oneminus1.visibleInInspector = false;
	Oneminus1.visibleOnFrame = false;
	Oneminus1.target = 4;

// InputBlock
	const EDGE_WIDTH = new InputBlock("EDGE_WIDTH");
	EDGE_WIDTH.visibleInInspector = false;
	EDGE_WIDTH.visibleOnFrame = false;
	EDGE_WIDTH.target = 1;
	EDGE_WIDTH.value = 0.03;
	EDGE_WIDTH.min = 0;
	EDGE_WIDTH.max = 1;
	EDGE_WIDTH.isBoolean = false;
	EDGE_WIDTH.matrixMode = 0;
	EDGE_WIDTH.animationType = AnimatedInputBlockTypes.None;
	EDGE_WIDTH.isConstant = false;

// InputBlock
	const Float2 = new InputBlock("Float");
	Float2.visibleInInspector = false;
	Float2.visibleOnFrame = false;
	Float2.target = 1;
	Float2.value = 0.5;
	Float2.min = 0;
	Float2.max = 0;
	Float2.isBoolean = false;
	Float2.matrixMode = 0;
	Float2.animationType = AnimatedInputBlockTypes.None;
	Float2.isConstant = false;

// Connections
	position.output.connectTo(WorldPos.vector);
	World.output.connectTo(WorldPos.transform);
	WorldPos.output.connectTo(WorldPosViewProjectionTransform.vector);
	ViewProjection.output.connectTo(WorldPosViewProjectionTransform.transform);
	WorldPosViewProjectionTransform.output.connectTo(VertexOutput.vector);
	ARROW_COLOR.output.connectTo(Lerp.left);
	BORDERS_COLOR.output.connectTo(Lerp.right);
	uv.output.connectTo(Add.left);
	Vector.output.connectTo(Add.right);
	Add.output.connectTo(VectorSplitter1.xyIn);
	VectorSplitter1.xyOut.connectTo(Dot.left);
	VectorSplitter1.xyOut.connectTo(Dot.right);
	Dot.output.connectTo(Sqrt.input);
	Sqrt.output.connectTo(Scale.input);
	Float1.output.connectTo(Scale.factor);
	Scale.output.connectTo(VectorMerger.x);
	VectorSplitter1.x.connectTo(ArcTan.x);
	VectorSplitter1.y.connectTo(ArcTan.y);
	ArcTan.output.connectTo(Divide.left);
	Float.output.connectTo(Divide.right);
	Divide.output.connectTo(VectorMerger.y);
	VectorMerger.xyz.connectTo(VectorSplitter.xyzIn);
	VectorSplitter.x.connectTo(Step.value);
	EDGE_WIDTH.output.connectTo(Oneminus1.input);
	Oneminus1.output.connectTo(Scale2.input);
	Float2.output.connectTo(Scale2.factor);
	Scale2.output.connectTo(Step.edge);
	Step.output.connectTo(Lerp.gradient);
	Lerp.output.connectTo(FragmentOutput.rgb);
	VectorMerger.xy.connectTo(Oneminus.input);
	Oneminus.output.connectTo(Multiply1.left);
	TEX_SCALING.output.connectTo(Multiply1.right);
	Multiply1.output.connectTo(Add1.left);
	Time.output.connectTo(Scale1.input);
	ANIMATION_SPEED.output.connectTo(Scale1.factor);
	Scale1.output.connectTo(VectorMerger1.x);
	VectorMerger1.xy.connectTo(Add1.right);
	Add1.output.connectTo(ARROW_TEX.uv);
	ARROW_TEX.r.connectTo(Remap.input);
	Remap.output.connectTo(Clamp.value);
	Clamp.output.connectTo(Multiply.left);
	VectorMerger.xyz.connectTo(Gradient.gradient);
	Gradient.output.connectTo(VectorSplitter2.xyzIn);
	VectorSplitter2.x.connectTo(Multiply.right);
	Multiply.output.connectTo(Add2.left);
	Step.output.connectTo(Add2.right);
	Add2.output.connectTo(Clamp1.value);
	Clamp1.output.connectTo(Add3.left);
	VISIBILITY.output.connectTo(Remap1.input);
	Remap1.output.connectTo(Add3.right);
	Add3.output.connectTo(Clamp2.value);
	Clamp2.output.connectTo(FragmentOutput.a);

// Output nodes
	nodeMaterial.addOutputNode(VertexOutput);
	nodeMaterial.addOutputNode(FragmentOutput);
	nodeMaterial.build();
	
	return nodeMaterial;
}