#!/bin/bash

#########################################################
#                                                       #
#   Construção e envio de imagem Docker                 #
#   Autor: Jose Araujo Neto - Engenheiro de Computação  #
#   Cargo: Engenheiro DevOps                            #
#                                                       #    
#########################################################

echo "Build Docker Image"


function docker-login {
    # Função responsavel por autenticação do repositorio Docker
    # $1 = Nome do repodsitorio Docker
    # $2 = Token ou Senha do Repositorio
    docker login -u "$1" -p "$2"
}

export ERROR_VAR=$?

if [[ "$ERROR_VAR" == 0 ]]; then
    echo "$GITHUB_ACTOR iniciou a contrução da imagem docker $IMAGE_NAME:$IMAGE_TAG."
    docker build -t "$IMAGE_NAME:$IMAGE_TAG" -f "$DOCKERFILE_PATH" 
    ERROR_VAR=$?
    if [[ "$ERROR_VAR" == 0 ]]; then
        echo "Pushing para Registro de Artefato"
        echo "Tag Stage"
        docker tag "$IMAGE_NAME:$IMAGE_TAG" "$REPOSITORY/$IMAGE_NAME:$IMAGE_TAG" 
        echo "Push Stage"
        docker-login "$REPOSITORY" "$DOCKER_ACCESS_TOKEN"
        docker push "$REPOSITORY/$IMAGE_NAME:$IMAGE_TAG"
        ERROR_VAR=$?
        if [[ "$ERROR_VAR" == 0 ]]; then
            echo "Imagem $IMAGE_NAME:$IMAGE_TAG criada com sucesso."
        else
            echo "Falha ao enviar a imagem $IMAGE_NAME:$IMAGE_TAG para repositorio Docker."
            exit 1
        fi
        
        echo "Cleanup Stage"
        sudo docker image rm "$IMAGE_NAME:$IMAGE_TAG" -f 
        sudo docker image rm "$REPOSITORY/$IMAGE_NAME:$IMAGE_TAG" -f
        
    else
        echo "Falha ao criar imagem $IMAGE_NAME:$IMAGE_TAG."
        exit 1
    fi
fi

echo "Finishing Build."
docker logout