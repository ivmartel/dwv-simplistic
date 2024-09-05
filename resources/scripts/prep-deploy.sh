#!/bin/bash
#Script to prepare a file for deploy

# exit when any command fails
set -e

# print usage information
usage() {
  echo ""
  echo "Usage: $0 -f fileName"
  echo -e "  -f the file to prepare for deploy"
  echo -e "Example:"
  echo -e "> prep-deploy -f build/viewer.html"
  echo ""
  exit 1 # Exit script after printing help
}

# messages
PREFIX="[prep]"
RESET_COLOR="\033[0m"
# print error message (red)
ERROR_COLOR="\033[1;91m"
error() {
  echo -e $ERROR_COLOR$PREFIX' '$1$RESET_COLOR
}
# print info message (blue)
INFO_COLOR="\033[1;94m"
info() {
  echo -e $INFO_COLOR$PREFIX' '$1$RESET_COLOR
}

# input options
while getopts "f:h" opt
do
   case "$opt" in
      f ) fileName="$OPTARG" ;;
      h ) usage ;;
      ? ) usage ;; # Print usage in case parameter is non-existent
   esac
done

# check option content
if [ -z "$fileName" ]
then
   error "Empty file name";
   usage
fi

info "Preparing deploy for '$fileName'"

if [ "$(grep -c "<!-- self -->" $fileName)" -eq 1 ]
then
  info "Enabling bundle"
  # remove start comment
  a1="\(<!-- self -->\)\(<!--\)"
  b1="\1"
  sed -i "s/${a1}/${b1}/g" $fileName
  # remove end comment
  a2="\(-->\)\(<!-- Launch the app -->\)"
  b2="\2"
  sed -i "s/${a2}/${b2}/g" $fileName
fi

if [ "$(grep -c "<!-- service workers -->" $fileName)" -eq 1 ]
then
  info "Enabling service workers"
  # remove start comment
  a1="\(<!-- service workers -->\)\(<!--\)"
  b1="\1"
  sed -i "s/${a1}/${b1}/g" $fileName
  # remove end comment
  a2="\(-->\)\(<!-- service workers end -->\)"
  b2="\2"
  sed -i "s/${a2}/${b2}/g" $fileName
fi
