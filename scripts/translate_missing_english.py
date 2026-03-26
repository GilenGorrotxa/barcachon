#!/usr/bin/env python3
"""
Script para traducir al inglés los items que usan español como fallback
"""

import json
import re

# Diccionario de traducciones comunes
TRANSLATIONS = {
    # Conjunciones y conectores
    ' y ': ' and ',
    ' o ': ' or ',
    ' con ': ' with ',
    ' de ': ' of ',
    ' del ': ' of the ',
    ' a la ': ' ',
    ' al ': ' with ',
    
    # Ingredientes
    'Pechuga de pollo': 'Chicken breast',
    'pollo': 'chicken',
    'pim. verde': 'green pepper',
    'pimiento': 'pepper',
    'pimientos': 'peppers',
    'queso': 'cheese',
    'bechamel': 'béchamel',
    'bexamel': 'béchamel',
    'Jamón': 'Ham',
    'jamón': 'ham',
    'ibérico': 'Iberian',
    'atún': 'tuna',
    'anchoas': 'anchovies',
    'guindillas': 'pickled peppers',
    'cebolla': 'onion',
    'tomate': 'tomato',
    'lechuga': 'lettuce',
    'huevo': 'egg',
    'huevos': 'eggs',
    'frito': 'fried',
    'frita': 'fried',
    'fritos': 'fried',
    'duro': 'hard-boiled',
    'cocido': 'boiled',
    'egosia': 'boiled',
    'Tortilla de patatas': 'Spanish omelette',
    'patatas': 'potatoes',
    'caseras': 'homemade',
    'bacon': 'bacon',
    'setas': 'mushrooms',
    'perretxikoak': 'mushrooms',
    'chorizo': 'chorizo',
    'txorizo': 'chorizo',
    'lomo': 'pork loin',
    'empanado': 'breaded',
    'empanada': 'breaded',
    'panatua': 'breaded',
    'alioli': 'aioli',
    'allioli': 'aioli',
    'mayonesa': 'mayonnaise',
    'mahonesa': 'mayonnaise',
    'espárrago': 'asparagus',
    'zainzuria': 'asparagus',
    'aceitunas': 'olives',
    'olibak': 'olives',
    'rellenas': 'stuffed',
    'salmón ahumado': 'smoked salmon',
    'izokin ketua': 'smoked salmon',
    'gulas': 'gulas',
    'langostinos': 'prawns',
    'otarrainxkak': 'prawns',
    'calamares': 'calamari',
    'txipiroiak': 'squid',
    'salsa': 'sauce',
    'opcional': 'optional',
    'aukeran': 'optional choice',
    'a la plancha': 'grilled',
    'plancha': 'grill',
    'variadas': 'assorted',
    'askotarikoa': 'assorted',
    'la tierra': 'regional',
    'rotos': 'broken',
    'apurtuak': 'broken',
    'filete': 'steak',
    'xerra': 'steak',
    'txuleta': 'steak',
    'txulleta': 'steak',
    'costilla': 'rib',
    'ternera': 'veal',
    'sahaiki': 'veal',
    'medio': 'medium',
    'media': 'half',
    'templado': 'warm',
    'epela': 'warm',
    'mejillones': 'mussels',
    'muskuilu': 'mussels',
    'milanesas': 'breaded cutlet',
    'milanesa': 'breaded cutlet',
    'guarnición': 'garnish',
    'pastel': 'pie',
    'pila': 'pie',
    'pescado': 'fish',
    'arrain': 'fish',
    'fresco': 'fresh',
    'freskoa': 'fresh',
    'día': 'day',
    'eguneko': 'daily',
    'guisantes': 'peas',
    'ilarrak': 'peas',
    'bacalao': 'cod',
    'bakailao': 'cod',
    'ajoarriero': 'ajoarriero style',
    'ensalada': 'salad',
    'entsalada': 'salad',
    'mixta': 'mixed',
    'mistoa': 'mixed',
    'clásica': 'classic',
    'klasika': 'classic',
    'clásico': 'classic',
    'nórdica': 'Nordic',
    'nordika': 'Nordic',
    'rústica': 'rustic',
    'rustika': 'rustic',
    'York': 'ham',
    'verde': 'green',
    'berdea': 'green',
    'verdes': 'green',
    'berdeekin': 'green',
    'rojo': 'red',
    'rojos': 'red',
    'gorriak': 'red',
    'piquillo': 'piquillo',
    'pikillo': 'piquillo',
    'gabardina': 'battered',
    'gabardinazko': 'battered',
    'pincho': 'skewer',
    'brocheta': 'skewer',
    'rape': 'monkfish',
    'zapoa': 'monkfish',
    'sepia': 'cuttlefish',
    'txibia': 'cuttlefish',
    'gambón': 'king prawn',
    'ganbak': 'prawns',
    'gambak': 'prawns',
    'bularkia': 'breast',
    'gazta': 'cheese',
    'crema': 'cream',
    'picada': 'chopped',
    'xehatua': 'chopped',
    'picado': 'chopped',
    'ahumado': 'smoked',
    'ketua': 'smoked',
    'AOVE': 'Extra virgin olive oil',
    'piperrak': 'peppers',
    'piper': 'pepper',
    'solomo': 'pork loin',
    'oilasko': 'chicken',
    'urdaiazpikoa': 'ham',
    'urdaiazpiko': 'ham',
    'tipula': 'onion',
    'tomatea': 'tomato',
    'letxuga': 'lettuce',
    'arrautza': 'egg',
    'frijitua': 'fried',
    'hirugiharra': 'bacon',
    'erdi egosia': 'poached',
    'pochada': 'poached',
}

def translate_text(text):
    """Traduce un texto de español a inglés usando el diccionario"""
    if not text:
        return text
    
    translated = text
    
    # Primero reemplazar frases completas y multipalabra
    multiword_translations = {k: v for k, v in TRANSLATIONS.items() if len(k.split()) > 2}
    for es, en in sorted(multiword_translations.items(), key=lambda x: len(x[0]), reverse=True):
        pattern = re.compile(re.escape(es), re.IGNORECASE)
        if pattern.search(translated):
            translated = pattern.sub(en, translated)
    
    # Luego palabras individuales y bipalabra
    for es, en in TRANSLATIONS.items():
        if len(es.split()) <= 2:
            pattern = re.compile(re.escape(es), re.IGNORECASE)
            if pattern.search(translated):
                # Mantener mayúscula inicial si es necesarioen_replacement = en.capitalize() if es[0].isupper() and es.lower() != es else en
                translated = pattern.sub(en_replacement, translated)
    
    # Post-procesamiento: limpiar espacios y puntuación
    translated = re.sub(r'\s+', ' ', translated)  # Múltiples espacios
    translated = re.sub(r'\s+,', ',', translated)  # Espacio antes de coma
    translated = re.sub(r',\s*,', ',', translated)  # Comas duplicadas
    translated = translated.strip()
    
    return translated

def translate_menu_items():
    """Lee el JSON, traduce items faltantes y guarda"""
    json_path = 'lib/menu-data.json'
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    translated_count = 0
    
    for item_id, item in data['items'].items():
        es_trans = item['translations']['es']
        en_trans = item['translations']['en']
        
        # Si el inglés es igual al español, traducir
        if en_trans.get('name') == es_trans.get('name'):
            # Mantener nombres propios sin traducir si son nombres especiales
            special_names = ['Cachón', 'Txisburger', 'Donosti', 'Desastre', 'Matu', 'Txispi', 
                           'Mirentxu', 'Pitu', 'Pakito', 'Bokata', 'Tximista', 'Ortzadar',
                           'Donostiarra', 'Cachoncitos', 'Marmitako']
            
            if es_trans.get('name') not in special_names:
                en_trans['name'] = translate_text(es_trans.get('name', ''))
        
        if en_trans.get('description') == es_trans.get('description'):
            en_trans['description'] = translate_text(es_trans.get('description', ''))
        
        if en_trans.get('extras') == es_trans.get('extras'):
            en_trans['extras'] = translate_text(es_trans.get('extras', ''))
        
        translated_count += 1
    
    # Guardar el JSON actualizado
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Traducción completada: {translated_count} items procesados")
    print(f"📄 Archivo actualizado: {json_path}")

if __name__ == '__main__':
    translate_menu_items()
