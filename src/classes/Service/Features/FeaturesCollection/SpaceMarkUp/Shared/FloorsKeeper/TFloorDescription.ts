import type {AbstractMesh}      from '@babylonjs/core/Meshes/abstractMesh';

export type FloorDescription = {
	// Он же работает как ключ.
	// Т.е. не может быть 2х записей с одним и тем же Mesh
	// Старые будут перетираться новыми
	mesh:AbstractMesh,
	
	// Замок - ловушка.
	// Если пользователь оказывается на этом floor,
	// то он больше не будет отпущен на другие, пока
	// эту лочку не снимут. Если эта настройка включена,
	// allowList будет проигнорирован.
	lock?:boolean,
	
	// Позволит переходить только на заданный перечень floor's
	// По умолчанию (при пустом или отсутсвующем массиве) позволяется переходить
	// на любой floor
	allowList?:AbstractMesh[],
	
	// Явно помечает флур, как скользский slope
	isSlope?:boolean
	// Индивидуальная настройка criticalAngle для Slope
	criticalAngleDeg?:number,
}