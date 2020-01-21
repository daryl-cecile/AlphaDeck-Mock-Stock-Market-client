
namespace Stock{

    export function findStock(terms:string, callback){
        $.ajax({
            url: "/api/shares/query?term=" + encodeURIComponent(terms),
            headers:{
                "X-CSRF-TOKEN" : Tools.csrfToken()
            }
        }).then(r => {
            callback(r);
        });
    }

}