#!/usr/bin/env python3
"""
Script para actualizar las traducciones al inglés con las proporcionadas por el usuario
"""

import json
import os

# Traducciones proporcionadas por el usuario
translations = {
    # PINTXOS
    "pintxos-001": {"name": "Cachoncitos", "description": "Chicken with green pepper, cheese and bechamel"},
    "pintxos-002": {"name": "Battered shrimp"},
    "pintxos-003": {"name": "Cod with peppers"},
    "pintxos-004": {"name": "Cooked mushrooms"},
    "pintxos-005": {"name": "Homemade lasagna"},
    "pintxos-006": {"name": "Grilled foie gras", "description": "with veg.tempura"},
    "pintxos-007": {"name": "Chorizo cooked in cider"},
    "pintxos-008": {"name": "Grilled Squids", "description": "with iberian ham"},
    "pintxos-009": {"name": "Battered fungi mushrooms"},
    "pintxos-010": {"name": "Pork crackling \"Soria\" style"},
    
    # BROCHETAS
    "brochetas-001": {"name": "Chicken or shrimps"},
    "brochetas-002": {"name": "Monkfish or squid"},
    
    # PARA COMPARTIR
    "para-compartir-001": {"name": "Calamari"},
    "para-compartir-002": {"name": "Patatas bravas Cachón", "description": "(or aioli)"},
    "para-compartir-003": {"name": "Vegetables in tempura"},
    "para-compartir-004": {"name": "Sauteed squid", "description": "(with peppers and shrimps)"},
    "para-compartir-005": {"name": "Chicken wings", "description": "(with aioli)"},
    "para-compartir-006": {"name": "Gulas a la donostiarra"},
    "para-compartir-007": {"name": "Cod peppers omelette", "description": "(or other)"},
    "para-compartir-008": {"name": "Galizian style octopus"},
    "para-compartir-009": {"name": "Grilled fungi mushrooms & garlic"},
    "para-compartir-010": {"name": "Chatka"},
    "para-compartir-011": {"name": "Russian salad", "description": "(or tuna mayo salad +1€)"},
    "para-compartir-012": {"name": "Hake cake"},
    "para-compartir-013": {"name": "Iberian ham platter"},
    "para-compartir-014": {"name": "Local cheese platter", "description": "(with quince and walnuts)"},
    
    # SANDWICHES
    "sandwiches-001": {"name": "Mixto", "description": "Ham & Cheese"},
    "sandwiches-002": {"name": "Vegetal", "description": "Lettuce, tomato, tuna, york ham, boiled egg and mayo"},
    "sandwiches-003": {"name": "Cachón", "description": "Lettuce, tomato, chicken breasts, cheese, bacon, fried egg and mayo"},
    "sandwiches-004": {"name": "Mazorriaga", "description": "Lettuce, shrimps, tuna and chatka"},
    
    # HAMBURGUESAS
    "hamburguesas-001": {"name": "Clasica", "description": "Lettuce, tomato and onion"},
    "hamburguesas-002": {"name": "Txisburger", "description": "Cheese, boiled egg and aioli"},
    "hamburguesas-003": {"name": "Cachón", "description": "Lettuce, tomato, bacon cheese, fried egg and poached onion"},
    
    # TOSTADAS
    "tostadas-001": {"name": "Clásica", "description": "Aove, tomato and iberian ham"},
    "tostadas-002": {"name": "Nórdica", "description": "Smoked salmon, onion, boiled egg (cream cheese)"},
    "tostadas-003": {"name": "Rústica", "description": "Sauteed Black pudding with piquillos, bacon and fried egg"},
    "tostadas-004": {"name": "Cabrita", "description": "Goat cheese, peppers and walnuts"},
    
    # BOCADILLOS
    "bocadillos-001": {"name": "A tu gusto", "description": "Chicken or Pork. Add extras for an additional €0.50 (Cheese/peppers/mushrooms/bacon)"},
    "bocadillos-002": {"name": "De la tierra", "description": "Lettuce, tomato, onion, asparagus, boiled egg and mayo. Add extras for an additional €1 (Chicken breast or york or tuna)"},
    "bocadillos-003": {"name": "Donosti", "description": "Tuna, anchovies, green chillies and onion"},
    "bocadillos-004": {"name": "Desastre", "description": "Scrambled chorizo potato and egg"},
    "bocadillos-005": {"name": "Matu", "description": "Breaded chicken with boiled egg, cheese and aioli"},
    "bocadillos-006": {"name": "Txispi", "description": "Pork loin, cheese and red pepper"},
    "bocadillos-007": {"name": "Mirentxu", "description": "Cheese, iberian ham, boiled egg and tomato"},
    "bocadillos-008": {"name": "Pitu", "description": "Iberian ham, mushrooms and green pepper"},
    "bocadillos-009": {"name": "Pakito", "description": "Steak and piquillo peppers"},
    "bocadillos-010": {"name": "Bokata", "description": "Spanish omelette"},
    "bocadillos-011": {"name": "Calamares", "description": "Calamari (option sauce)"},
    "bocadillos-012": {"name": "Mixto ibérico", "description": "Grilled iberian ham and cheese"},
    "bocadillos-013": {"name": "Mixto York", "description": "Grilled ham and cheese"},
    
    # ENSALADAS
    "ensaladas-001": {"name": "Cachón", "description": "Lettuce, tomato, onion, iberian ham, tuna endive, gulas and smoked salmon"},
    "ensaladas-002": {"name": "Tximista", "description": "Mezclum, goat cheese, pineapple cherry, walnuts, raisins, boiled egg and ham"},
    "ensaladas-003": {"name": "Ortzadar", "description": "Pasta salad, sweetcorn, tomato, olives, tuna anchovies, prawns and piquillo pepper"},
    "ensaladas-004": {"name": "Donostiarra", "description": "Tomato, tuna, green chillies, anchovies, olives and onion"},
    "ensaladas-005": {"name": "Templada", "description": "Lettuce, cherry, shrimps, gulas, squid and fungi mushroom"},
    "ensaladas-006": {"name": "Mixta", "description": "Lettuce, tomato, onion, tuna, boiled egg, olives and asparragus"},
    
    # PLATOS COMBINADOS
    "platos-combinados-001": {"name": "Nº1", "description": "Fried eggs, iberian ham, peppers and fries"},
    "platos-combinados-002": {"name": "Nº2", "description": "Breaded pork loin with cheese, russian salad, peppers and fries"},
    "platos-combinados-003": {"name": "Nº3", "description": "Breaded steak (or grilled), fried egg, peppers and fries"},
    "platos-combinados-004": {"name": "Nº4", "description": "Grilled chicken breasts, salad, bacon and fries"},
    "platos-combinados-005": {"name": "Nº5", "description": "Spaggetti bolognese (homemade), 2 ham and croquettes"},
    "platos-combinados-006": {"name": "Nº6", "description": "Battered hake, salad and grilled squids and mayo"},
    "platos-combinados-007": {"name": "Nº7", "description": "Mezclum, fungi mushrooms, piquillos, veggie burger and veg. tempura"},
    "platos-combinados-008": {"name": "Nº8", "description": "Fried eggs, croquettes, calamari and fries"},
    "platos-combinados-009": {"name": "Nº9", "description": "Entrecot, piquillo peppers and fries (sauce option)"},
    
    # MENU INFANTIL
    "menu-infantil-001": {"name": "Nº10", "description": "Chicken breats or pork loin with fries"},
    "menu-infantil-002": {"name": "Nº11", "description": "Spaguetti with tomato sauce"},
    "menu-infantil-003": {"name": "Nº12", "description": "Fried eggs with fries"},
    
    # MENU DEL DIA
    "menu-del-dia-001": {"name": "MARMITAKO", "description": "PESCADO fresco del DÍA"},
    "menu-del-dia-002": {"name": "GUISANTES con JAMÓN", "description": "BACALAO AJOARRIERO"},
    "menu-del-dia-003": {"name": "PASTEL templado de MEJILLONES", "description": "MILANESAS de LOMO con GUARNICIÓN"},
    "menu-del-dia-004": {"name": "\"DESASTRE\"", "description": "COSTILLA de TERNERA con PIMIENTOS verdes"},
    "menu-del-dia-005": {"name": "ENSALADA MIXTA", "description": "FILETE con PATATAS caseras (ENTRECÔTTE + 3 €)"},
    
    # POSTRES
    "postres-001": {"name": "HOMEMADE DESSERTS"},
    "postres-002": {"name": "VARIED PIES"},
    "postres-003": {"name": "YOGURT"},
    "postres-004": {"name": "ICE CREAM CUP"},
    
    # CAFES
    "cafes-001": {"name": "ESPRESSO, CUT"},
    "cafes-002": {"name": "WITH MILK"},
    "cafes-003": {"name": "CAPPUCCINO"},
    "cafes-004": {"name": "INFUSION/TEA"},
    "cafes-005": {"name": "HOT CHOCOLATE"},
    "cafes-006": {"name": "BREAKFAST"},
    "cafes-007": {"name": "GLASS OF MILK"},
    "cafes-008": {"name": "BREAKFAST WITH JUICE"},
    "cafes-009": {"name": "COFFEE WITH BRANDY"},
    "cafes-010": {"name": "COFFEE WITH BAILEY´S"},
    "cafes-011": {"name": "CARAJILLO WITH BRANDY"},
    "cafes-012": {"name": "CARAJILLO WHISKY/RUM"},
    
    # REFRESCOS
    "refrescos-001": {"name": "SOFT DRINKS"},
    "refrescos-002": {"name": "JUICES / SMOOTHIES"},
    "refrescos-003": {"name": "LARGE SOFT DRINKS"},
    "refrescos-004": {"name": "WATER"},
    "refrescos-005": {"name": "SODA"},
    "refrescos-006": {"name": "CANS (to go)"},
    "refrescos-007": {"name": "PERRIER"},
    
    # CERVEZAS
    "cervezas-001": {"name": "CAÑA/C.LIMON / 0,0"},
    "cervezas-002": {"name": "CAÑA TOSTADA"},
    "cervezas-003": {"name": "ZURITO /TOSTADO"},
    "cervezas-004": {"name": "KELER TXIKI / HANDI"},
    "cervezas-005": {"name": "ESTRELLA GALICIA TXIKI/HANDI"},
    "cervezas-006": {"name": "BOT. TOSTADA 0,0"},
    "cervezas-007": {"name": "BOT. SIN ALCOHOL 1/5"},
    "cervezas-008": {"name": "HEINEKEN"},
    "cervezas-009": {"name": "ALHAMBRA"},
    "cervezas-010": {"name": "VOLTDAMM"},
    "cervezas-011": {"name": "IPA"},
    "cervezas-012": {"name": "LATA AMBAR"},
    
    # VINOS
    "vinos-001": {"name": "Red of the Year"},
    "vinos-002": {"name": "LUIS CAÑAS YEAR"},
    "vinos-003": {"name": "CRIANZAS (BORDON,BERONIA,VIÑAREAL,PdA,..)"},
    "vinos-004": {"name": "RIOJA RESERVE"},
    "vinos-005": {"name": "CAMPILLO"},
    "vinos-006": {"name": "MUGA"},
    "vinos-007": {"name": "RIBERA DEL DUERO"},
    "vinos-008": {"name": "AZPILICUETA"},
    "vinos-009": {"name": "12MOONS SOMONTANO"},
    "vinos-010": {"name": "WHITE RUEDA"},
    "vinos-011": {"name": "WHITE VERDEJO SUP."},
    "vinos-012": {"name": "CHARDONNAY"},
    "vinos-013": {"name": "ENATE CHARDONNAY"},
    "vinos-014": {"name": "WHITE RIOJA"},
    "vinos-015": {"name": "MOSCATO"},
    "vinos-016": {"name": "ALBARIÑO"},
    "vinos-017": {"name": "JOSE PARIENTE VERDEJO"},
    "vinos-018": {"name": "MONJARDIN CHARDONNAY"},
    "vinos-019": {"name": "ROSADO GRAN FEUDO"},
    "vinos-020": {"name": "ROSADO ROSÉ O CORDOVIN"},
    "vinos-021": {"name": "CRESTA ROSA"},
    "vinos-022": {"name": "TXAKOLI"},
    "vinos-023": {"name": "CIDER"},
    "vinos-024": {"name": "CAVA"},
    "vinos-025": {"name": "KALIMOTXO"},
    "vinos-026": {"name": "SANGRIA"},
    "vinos-027": {"name": "SUMMER RED"},
    
    # APERITIVOS
    "aperitivos-001": {"name": "GRAPE JUICE"},
    "aperitivos-002": {"name": "MARIANITO"},
    "aperitivos-003": {"name": "VERMOUTH (with +0.50€)"},
    "aperitivos-004": {"name": "WITH CAVA, CAMPARI OR GIN"},
    "aperitivos-005": {"name": "BITTER CINZANO"},
    "aperitivos-006": {"name": "COPA CAMPARI"},
    "aperitivos-007": {"name": "RICARD"},
    "aperitivos-008": {"name": "MOSCATEL"},
    "aperitivos-009": {"name": "FINOS"},
    "aperitivos-010": {"name": "LA GUITA"},
    
    # COPAS
    "copas-licores-001": {"name": "Anise or Cognac"},
    "copas-licores-002": {"name": "Marie Brizard"},
    "copas-licores-003": {"name": "Magno"},
    "copas-licores-004": {"name": "Herb Infused Aguardiente"},
    "copas-licores-005": {"name": "TXUPITO BAILEY´S/LICOR43/COINTREAU"},
    "copas-licores-006": {"name": "TXUPITO DE HIERBAS/CAFÉ/BLANCO"},
    "copas-licores-007": {"name": "TXUPITO PACHARAN"},
    "copas-licores-008": {"name": "TXUPITO ANIS O COÑAC"},
    "copas-licores-009": {"name": "TXUPITO MAGNO"},
    "copas-licores-010": {"name": "TXUPITO WHISKY"},
    "copas-licores-011": {"name": "BAILEY´S"},
    "copas-licores-012": {"name": "PATXARAN"},
    "copas-licores-013": {"name": "JACK DANIELS"},
    "copas-licores-014": {"name": "CARDHU"},
    "copas-licores-015": {"name": "RED LABEL"},
    "copas-licores-016": {"name": "BLACK LABEL"},
    "copas-licores-017": {"name": "SOBERANO"},
    "copas-licores-018": {"name": "CARLOS I"},
    "copas-licores-019": {"name": "CHIVAS"},
    "copas-licores-020": {"name": "JAGGERMAISTER / TEQUILA"},
    
    # COMBINADOS
    "combinados-001": {"name": "SELECTED COMBINATIONS"},
    "combinados-002": {"name": "PREMIUM COMBINATIONS"},
}

def update_translations():
    """Actualiza las traducciones en el JSON"""
    json_path = os.path.join(os.path.dirname(__file__), '..', 'lib', 'menu-data.json')
    
    print("🔄 Cargando menu-data.json...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    updated_count = 0
    
    print("\n📝 Actualizando traducciones al inglés...")
    for item_id, translation in translations.items():
        if item_id in data['items']:
            item = data['items'][item_id]
            
            # Actualizar nombre
            if 'name' in translation:
                item['translations']['en']['name'] = translation['name']
                updated_count += 1
            
            # Actualizar descripción si existe
            if 'description' in translation:
                item['translations']['en']['description'] = translation['description']
            
            # Actualizar extras si existe
            if 'extras' in translation:
                item['translations']['en']['extras'] = translation['extras']
                
            print(f"   ✓ {item_id}: {translation['name']}")
        else:
            print(f"   ⚠️  No encontrado: {item_id}")
    
    print(f"\n💾 Guardando cambios...")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Actualización completada!")
    print(f"   • Items actualizados: {updated_count}")
    print(f"   • Archivo: {json_path}")

if __name__ == '__main__':
    update_translations()
