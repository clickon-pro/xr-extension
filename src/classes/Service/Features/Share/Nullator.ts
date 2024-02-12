
type PTypeName = 'method' | 'getter' | 'setter' | 'accessor';

// for extend
export const Nullator = (
	object:Object,
	mode?:'keepByList' | 'removeByList' | 'all',
	list?:string[]
)=>{
	
	const getAllPropertiesWithDescriptors = (obj:Object)=> {
		const props = new Map();
		
	/*	Object.getOwnPropertyNames(obj).forEach((prop) => {
			if (!props.has(prop)) {
				props.set(prop, Object.getOwnPropertyDescriptor(obj, prop));
			}
		});*/
		
		do {
			Object.getOwnPropertyNames(obj).forEach((prop) => {
				if (!props.has(prop)) {
					props.set(prop, Object.getOwnPropertyDescriptor(obj, prop));
				}
			});
		} while ((obj = Object.getPrototypeOf(obj)));
		
		return props;
	}
	
	const getAllMethodsAndAccessors = (obj:object): {name:string, type:PTypeName}[] => {
		const allProps = getAllPropertiesWithDescriptors(obj);
		const props:{name:string, type:PTypeName}[] = [];
		
		allProps.forEach((descriptor, prop) => {
			let was = false;
			// Проверяем, является ли это обычным методом
			if (typeof descriptor.value === "function") {
				props.push({ name: prop, type: "method" });
				was = true;
			}
			
			// Проверяем, является ли это геттером
			if (typeof descriptor.get === "function") {
				props.push({ name: prop, type: "getter" });
				was = true;
			}
			
			// Проверяем, является ли это сеттером
			if (typeof descriptor.set === "function") {
				props.push({ name: prop, type: "setter" });
				was = true;
			}
			
			if (!was) props.push({ name: prop, type: "accessor" });
			
		});
		
		return props;
	}
	
	const fullList = getAllMethodsAndAccessors(object);
	
	if(
		(mode == 'all')
		|| (mode == undefined)
		|| (list == undefined)
	){
		fullList.forEach((property)=>{
			delete object[property.name as keyof typeof object];
		});
	}else if(mode == 'removeByList'){
		list.forEach((propertyName)=>{
			const rec = fullList.find((rec)=>{
				return rec.name == propertyName;
			})
			if(rec) delete object[rec.name as keyof typeof object];
		});
	}else{
		if(mode == 'keepByList'){
			fullList.forEach((property)=>{
				if(!list.includes(property.name)) {
					// if (property.type == 'method')
					delete object[property.name as keyof typeof object];
				}
			});
		}
	}
}