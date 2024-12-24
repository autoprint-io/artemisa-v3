#!/bin/bash
mkdir -p logs
echo ">> Tree level 2" > logs/tree2.txt
tree -L 2 >> logs/tree2.txt

echo ">> Git status" > logs/gitStatus.txt
git status >> logs/gitStatus.txt

echo ">> NPM list" > logs/npmList.txt
npm list --depth=0 >> logs/npmList.txt

echo "Completado. Archivos en logs/"
