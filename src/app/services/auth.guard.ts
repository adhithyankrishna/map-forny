import { inject } from "@angular/core";
import { AuthService } from "./auth.service";
import { Router } from "@angular/router";


export const authgurd = ()=>{
    const auth = inject(AuthService);
    const router = inject(Router); 

    if (auth.login()){
        return true;
    }
    else {
        return false;
    }
}