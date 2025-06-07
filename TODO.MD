Done:

1. Dump de 3 tipos de errores: Parsing, Traversing, Metric
2. No se pueden ejecutar metricas individualmente sin considerar sus dependencias


To-do:

1. metricas como servicio
2. testing
3. identificar por clase+path
4. logger y comunicar errores

1. patron de diseño Pipeline, investigar patrones para el result
2. Interfaz de cada result
3. add status to metrics


En la metrica files, poner el path y el nombre por separado
Calcular fan-in y separar fan-out en file-coupling


Confiar en el nombre para hacer el hash 