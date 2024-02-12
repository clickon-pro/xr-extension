import {NodeMaterial}           from '@babylonjs/core/Materials/Node/nodeMaterial';
import {Vector2}                from '@babylonjs/core/Maths/math.vector';
import {Color3}                 from '@babylonjs/core/Maths/math.color';
import {InputBlock}             from '@babylonjs/core/Materials/Node/Blocks/Input/inputBlock';
import {Texture}                from '@babylonjs/core/Materials/Textures/texture';
import {TransformBlock}         from '@babylonjs/core/Materials/Node/Blocks/transformBlock';
import {VertexOutputBlock}      from '@babylonjs/core/Materials/Node/Blocks/Vertex/vertexOutputBlock';
import {AddBlock}               from '@babylonjs/core/Materials/Node/Blocks/addBlock';
import {OneMinusBlock}          from '@babylonjs/core/Materials/Node/Blocks/oneMinusBlock';
import {ScaleBlock}             from '@babylonjs/core/Materials/Node/Blocks/scaleBlock';
import {TextureBlock}           from '@babylonjs/core/Materials/Node/Blocks/Dual/textureBlock';
import {RemapBlock}             from '@babylonjs/core/Materials/Node/Blocks/remapBlock';
import {ClampBlock}             from '@babylonjs/core/Materials/Node/Blocks/clampBlock';
import {GradientBlock}          from '@babylonjs/core/Materials/Node/Blocks/gradientBlock';
import {VectorSplitterBlock}    from '@babylonjs/core/Materials/Node/Blocks/vectorSplitterBlock';
import {LerpBlock}              from '@babylonjs/core/Materials/Node/Blocks/lerpBlock';
import {MultiplyBlock}          from '@babylonjs/core/Materials/Node/Blocks/multiplyBlock';
import {ColorSplitterBlock}     from '@babylonjs/core/Materials/Node/Blocks/colorSplitterBlock';
import {GradientBlockColorStep} from '@babylonjs/core/Materials/Node/Blocks/gradientBlock';
import {VectorMergerBlock}      from '@babylonjs/core/Materials/Node/Blocks/vectorMergerBlock';
import {FragmentOutputBlock}    from '@babylonjs/core/Materials/Node/Blocks/Fragment/fragmentOutputBlock';
import {AnimatedInputBlockTypes}    from '@babylonjs/core/Materials/Node/Blocks/Input/animatedInputBlockTypes';
import {NodeMaterialModes}          from '@babylonjs/core/Materials/Node/Enums/nodeMaterialModes';
import {NodeMaterialSystemValues}   from '@babylonjs/core/Materials/Node/Enums/nodeMaterialSystemValues';
import type {Scene}                 from '@babylonjs/core/scene';


export const HopMaterial = (scene:Scene):NodeMaterial =>{
	var nodeMaterial = new NodeMaterial("teleport-hop-line", scene);
	nodeMaterial.mode = NodeMaterialModes.Material;
	nodeMaterial.backFaceCulling = false;

// InputBlock
	var position = new InputBlock("position");
	position.visibleInInspector = false;
	position.visibleOnFrame = false;
	position.target = 1;
	position.setAsAttribute("position");

// TransformBlock
	var WorldPos = new TransformBlock("WorldPos");
	WorldPos.visibleInInspector = false;
	WorldPos.visibleOnFrame = false;
	WorldPos.target = 1;
	WorldPos.complementZ = 0;
	WorldPos.complementW = 1;

// InputBlock
	var World = new InputBlock("World");
	World.visibleInInspector = false;
	World.visibleOnFrame = false;
	World.target = 1;
	World.setAsSystemValue(NodeMaterialSystemValues.World);

// TransformBlock
	var WorldPosViewProjectionTransform = new TransformBlock("WorldPos * ViewProjectionTransform");
	WorldPosViewProjectionTransform.visibleInInspector = false;
	WorldPosViewProjectionTransform.visibleOnFrame = false;
	WorldPosViewProjectionTransform.target = 1;
	WorldPosViewProjectionTransform.complementZ = 0;
	WorldPosViewProjectionTransform.complementW = 1;

// InputBlock
	var ViewProjection = new InputBlock("ViewProjection");
	ViewProjection.visibleInInspector = false;
	ViewProjection.visibleOnFrame = false;
	ViewProjection.target = 1;
	ViewProjection.setAsSystemValue(NodeMaterialSystemValues.ViewProjection);

// VertexOutputBlock
	var VertexOutput = new VertexOutputBlock("VertexOutput");
	VertexOutput.visibleInInspector = false;
	VertexOutput.visibleOnFrame = false;
	VertexOutput.target = 1;

// InputBlock
	var uv = new InputBlock("uv");
	uv.visibleInInspector = false;
	uv.visibleOnFrame = false;
	uv.target = 1;
	uv.setAsAttribute("uv");

// AddBlock
	var Add = new AddBlock("Add");
	Add.visibleInInspector = false;
	Add.visibleOnFrame = false;
	Add.target = 4;

// VectorMergerBlock
	var VectorMerger = new VectorMergerBlock("VectorMerger");
	VectorMerger.visibleInInspector = false;
	VectorMerger.visibleOnFrame = false;
	VectorMerger.target = 4;
	VectorMerger.xSwizzle = "x";
	VectorMerger.ySwizzle = "y";
	VectorMerger.zSwizzle = "z";
	VectorMerger.wSwizzle = "w";

// OneMinusBlock
	var Oneminus = new OneMinusBlock("One minus");
	Oneminus.visibleInInspector = false;
	Oneminus.visibleOnFrame = false;
	Oneminus.target = 4;

// ScaleBlock
	var Scale = new ScaleBlock("Scale");
	Scale.visibleInInspector = false;
	Scale.visibleOnFrame = false;
	Scale.target = 4;

// InputBlock
	var Time = new InputBlock("Time");
	Time.visibleInInspector = false;
	Time.visibleOnFrame = false;
	Time.target = 1;
	Time.value = 411.17406000015853;
	Time.min = 0;
	Time.max = 0;
	Time.isBoolean = false;
	Time.matrixMode = 0;
	Time.animationType = AnimatedInputBlockTypes.Time;
	Time.isConstant = false;

// InputBlock
	var ANIMATION_SPEED = new InputBlock("ANIMATION_SPEED");
	ANIMATION_SPEED.visibleInInspector = false;
	ANIMATION_SPEED.visibleOnFrame = false;
	ANIMATION_SPEED.target = 1;
	ANIMATION_SPEED.value = 0.15;
	ANIMATION_SPEED.min = 0;
	ANIMATION_SPEED.max = 1;
	ANIMATION_SPEED.isBoolean = false;
	ANIMATION_SPEED.matrixMode = 0;
	ANIMATION_SPEED.animationType = AnimatedInputBlockTypes.None;
	ANIMATION_SPEED.isConstant = false;

// MultiplyBlock
	var Multiply = new MultiplyBlock("Multiply");
	Multiply.visibleInInspector = false;
	Multiply.visibleOnFrame = false;
	Multiply.target = 4;

// InputBlock
	var TEX_SCALING = new InputBlock("TEX_SCALING");
	TEX_SCALING.visibleInInspector = false;
	TEX_SCALING.visibleOnFrame = false;
	TEX_SCALING.target = 1;
	TEX_SCALING.value = new Vector2(1, 1);
	TEX_SCALING.isConstant = false;

// TextureBlock
	var ARROW_TEX = new TextureBlock("ARROW_TEX");
	ARROW_TEX.visibleInInspector = false;
	ARROW_TEX.visibleOnFrame = false;
	ARROW_TEX.target = 3;
	ARROW_TEX.convertToGammaSpace = false;
	ARROW_TEX.convertToLinearSpace = false;
	ARROW_TEX.disableLevelMultiplication = false;
	ARROW_TEX.texture = new Texture("data:octet/stream;base64,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AQAAAAEAAAAAAAAAWE1QIPAMAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA0LjQuMC1FeGl2MiI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOmE1ZjY5OTZkLTNkODYtNDY5YS05MWYwLTcxOTQyM2YyZmM2MiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozODc4YmMyMS05NjVmLTQ5OGItOTg5NS1mNGVjNzAyOTYxOWMiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDplZTg4YmQxZC1iYmJkLTRlM2QtYmNlZC01YTgzNjZmZDAzMmUiIGRjOkZvcm1hdD0iaW1hZ2Uvd2VicCIgR0lNUDpBUEk9IjIuMCIgR0lNUDpQbGF0Zm9ybT0iTGludXgiIEdJTVA6VGltZVN0YW1wPSIxNzI3ODkyNjg0MjI3MjY0IiBHSU1QOlZlcnNpb249IjIuMTAuMzYiIHRpZmY6T3JpZW50YXRpb249IjEiIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0OjEwOjAyVDE5OjExOjIzKzAxOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNDoxMDowMlQxOToxMToyMyswMTowMCI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDpjaGFuZ2VkPSIvIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjg2ZGZhYmZhLTY5MDUtNGI4Yi1hNGJhLTA5Mzk0Y2YyOGI0NyIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChMaW51eCkiIHN0RXZ0OndoZW49IjIwMjQtMTAtMDJUMTk6MTE6MjQrMDE6MDAiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw/eHBhY2tldCBlbmQ9InciPz4=", null, false, false, 3);
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

// MultiplyBlock
	var Multiply1 = new MultiplyBlock("Multiply");
	Multiply1.visibleInInspector = false;
	Multiply1.visibleOnFrame = false;
	Multiply1.target = 4;

// InputBlock
	var ARROW_COLOR = new InputBlock("ARROW_COLOR");
	ARROW_COLOR.visibleInInspector = false;
	ARROW_COLOR.visibleOnFrame = false;
	ARROW_COLOR.target = 1;
	ARROW_COLOR.value = new Color3(1, 1, 1);
	ARROW_COLOR.isConstant = false;

// LerpBlock
	var Lerp = new LerpBlock("Lerp");
	Lerp.visibleInInspector = false;
	Lerp.visibleOnFrame = false;
	Lerp.target = 4;

// MultiplyBlock
	var Multiply2 = new MultiplyBlock("Multiply");
	Multiply2.visibleInInspector = false;
	Multiply2.visibleOnFrame = false;
	Multiply2.target = 4;

// GradientBlock
	var Gradient = new GradientBlock("Gradient");
	Gradient.visibleInInspector = false;
	Gradient.visibleOnFrame = false;
	Gradient.target = 4;
	Gradient.colorSteps = [];
	Gradient.colorSteps.push(new GradientBlockColorStep(0.03, new Color3(1, 1, 1)));
	Gradient.colorSteps.push(new GradientBlockColorStep(0.03, new Color3(0, 0, 0)));

// GradientBlock
	var Gradient1 = new GradientBlock("Gradient");
	Gradient1.visibleInInspector = false;
	Gradient1.visibleOnFrame = false;
	Gradient1.target = 4;
	Gradient1.colorSteps = [];
	Gradient1.colorSteps.push(new GradientBlockColorStep(0, new Color3(0, 0, 0)));
	Gradient1.colorSteps.push(new GradientBlockColorStep(0.5, new Color3(1, 1, 1)));
	Gradient1.colorSteps.push(new GradientBlockColorStep(1, new Color3(0, 0, 0)));

// VectorSplitterBlock
	var VectorSplitter = new VectorSplitterBlock("VectorSplitter");
	VectorSplitter.visibleInInspector = false;
	VectorSplitter.visibleOnFrame = false;
	VectorSplitter.target = 4;

// RemapBlock
	var Remap = new RemapBlock("Remap");
	Remap.visibleInInspector = false;
	Remap.visibleOnFrame = false;
	Remap.target = 4;
	Remap.sourceRange = new Vector2(0, 1);
	Remap.targetRange = new Vector2(0, 1);

// VectorSplitterBlock
	var VectorSplitter1 = new VectorSplitterBlock("VectorSplitter");
	VectorSplitter1.visibleInInspector = false;
	VectorSplitter1.visibleOnFrame = false;
	VectorSplitter1.target = 4;

// AddBlock
	var Add1 = new AddBlock("Add");
	Add1.visibleInInspector = false;
	Add1.visibleOnFrame = false;
	Add1.target = 4;

// ClampBlock
	var Clamp = new ClampBlock("Clamp");
	Clamp.visibleInInspector = false;
	Clamp.visibleOnFrame = false;
	Clamp.target = 4;
	Clamp.minimum = 0;
	Clamp.maximum = 1;

// MultiplyBlock
	var Multiply3 = new MultiplyBlock("Multiply");
	Multiply3.visibleInInspector = false;
	Multiply3.visibleOnFrame = false;
	Multiply3.target = 4;

// ClampBlock
	var Clamp1 = new ClampBlock("Clamp");
	Clamp1.visibleInInspector = false;
	Clamp1.visibleOnFrame = false;
	Clamp1.target = 4;
	Clamp1.minimum = 0;
	Clamp1.maximum = 1;

// RemapBlock
	var Remap1 = new RemapBlock("Remap");
	Remap1.visibleInInspector = false;
	Remap1.visibleOnFrame = false;
	Remap1.target = 4;
	Remap1.sourceRange = new Vector2(0, 1);
	Remap1.targetRange = new Vector2(0, 15);

// ColorSplitterBlock
	var ColorSplitter = new ColorSplitterBlock("ColorSplitter");
	ColorSplitter.visibleInInspector = false;
	ColorSplitter.visibleOnFrame = false;
	ColorSplitter.target = 4;

// GradientBlock
	var Gradient2 = new GradientBlock("Gradient");
	Gradient2.visibleInInspector = false;
	Gradient2.visibleOnFrame = false;
	Gradient2.target = 4;
	Gradient2.colorSteps = [];
	Gradient2.colorSteps.push(new GradientBlockColorStep(0, new Color3(0, 0, 0)));
	Gradient2.colorSteps.push(new GradientBlockColorStep(0.5, new Color3(1, 1, 1)));
	Gradient2.colorSteps.push(new GradientBlockColorStep(1, new Color3(0, 0, 0)));

// VectorSplitterBlock
	var VectorSplitter2 = new VectorSplitterBlock("VectorSplitter");
	VectorSplitter2.visibleInInspector = false;
	VectorSplitter2.visibleOnFrame = false;
	VectorSplitter2.target = 4;

// VectorMergerBlock
	var VectorMerger1 = new VectorMergerBlock("VectorMerger");
	VectorMerger1.visibleInInspector = false;
	VectorMerger1.visibleOnFrame = false;
	VectorMerger1.target = 4;
	VectorMerger1.xSwizzle = "x";
	VectorMerger1.ySwizzle = "y";
	VectorMerger1.zSwizzle = "z";
	VectorMerger1.wSwizzle = "w";

// FragmentOutputBlock
	var FragmentOutput = new FragmentOutputBlock("FragmentOutput");
	FragmentOutput.visibleInInspector = false;
	FragmentOutput.visibleOnFrame = false;
	FragmentOutput.target = 2;
	FragmentOutput.convertToGammaSpace = false;
	FragmentOutput.convertToLinearSpace = false;
	FragmentOutput.useLogarithmicDepth = false;

// InputBlock
	var BORDERS_COLOR = new InputBlock("BORDERS_COLOR");
	BORDERS_COLOR.visibleInInspector = false;
	BORDERS_COLOR.visibleOnFrame = false;
	BORDERS_COLOR.target = 1;
	BORDERS_COLOR.value = new Color3(1, 1, 1);
	BORDERS_COLOR.isConstant = false;

// Connections
	position.output.connectTo(WorldPos.vector);
	World.output.connectTo(WorldPos.transform);
	WorldPos.output.connectTo(WorldPosViewProjectionTransform.vector);
	ViewProjection.output.connectTo(WorldPosViewProjectionTransform.transform);
	WorldPosViewProjectionTransform.output.connectTo(VertexOutput.vector);
	uv.output.connectTo(Add.left);
	Time.output.connectTo(Scale.input);
	ANIMATION_SPEED.output.connectTo(Scale.factor);
	Scale.output.connectTo(Oneminus.input);
	Oneminus.output.connectTo(VectorMerger.x);
	VectorMerger.xy.connectTo(Add.right);
	Add.output.connectTo(Multiply.left);
	TEX_SCALING.output.connectTo(Multiply.right);
	Multiply.output.connectTo(ARROW_TEX.uv);
	ARROW_TEX.rgb.connectTo(Multiply1.left);
	ARROW_COLOR.output.connectTo(Multiply1.right);
	Multiply1.output.connectTo(Lerp.left);
	uv.output.connectTo(Remap.input);
	Remap.output.connectTo(VectorSplitter.xyIn);
	VectorSplitter.y.connectTo(Gradient1.gradient);
	Gradient1.output.connectTo(Gradient.gradient);
	Gradient.output.connectTo(Multiply2.left);
	BORDERS_COLOR.output.connectTo(Multiply2.right);
	Multiply2.output.connectTo(Lerp.right);
	Gradient.output.connectTo(Lerp.gradient);
	Lerp.output.connectTo(FragmentOutput.rgb);
	uv.output.connectTo(VectorMerger1.xyIn);
	VectorMerger1.xy.connectTo(VectorSplitter2.xyIn);
	VectorSplitter2.x.connectTo(Gradient2.gradient);
	Gradient2.output.connectTo(ColorSplitter.rgbIn);
	ColorSplitter.r.connectTo(Remap1.input);
	Remap1.output.connectTo(Clamp1.value);
	Clamp1.output.connectTo(Multiply3.left);
	ARROW_TEX.a.connectTo(Add1.left);
	Gradient.output.connectTo(VectorSplitter1.xyzIn);
	VectorSplitter1.x.connectTo(Add1.right);
	Add1.output.connectTo(Clamp.value);
	Clamp.output.connectTo(Multiply3.right);
	Multiply3.output.connectTo(FragmentOutput.a);

// Output nodes
	nodeMaterial.addOutputNode(VertexOutput);
	nodeMaterial.addOutputNode(FragmentOutput);
	nodeMaterial.build();

	return nodeMaterial;
};