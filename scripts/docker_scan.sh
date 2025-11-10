#!/bin/bash

#########################################################
#                                                       #
#   Teste de imagem Docker                              #
#   Autor: Jose Araujo Neto - Engenheiro de Computação  #
#   Cargo: Engenheiro DevOps                            #
#                                                       #    
#########################################################

echo "Test and Push Docker Image"



export ERROR_VAR=$?

if [[ "$ERROR_VAR" == 0 ]]; then

    docker scout recommendations "$IMAGE_NAME:$IMAGE_TAG"
fi

echo "Finishing Test."