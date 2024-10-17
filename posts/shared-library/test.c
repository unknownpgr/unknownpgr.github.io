#include <stdio.h>

int global_var = 0;

void print_global_var(){
	printf("Global var = %d\n", global_var);
}

int main(){
	print_global_var();
	return 0;
}

