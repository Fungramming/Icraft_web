/*global Cognito _config AmazonCognitoIdentity AWSCognito*/

var Cognito = window.Cognito || {};

(function rideScopeWrapper($) {
    // check auth
    var authToken;
    Cognito.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });
    
    // tab btn
    var tabBtn = $(".tab-btn a");    
    var tableLi = $(".table-tab li");    
    var paginationLi = $(".pagination-tab li");

    $(tabBtn[0]).on('click',function(event){        
        event.preventDefault();
        $(tableLi).removeClass("active")
        $(tableLi[0]).addClass("active")
        var page = getUrlParam('page');        
        var cate = 'recruit';        
        var dataLength = $(".active .table tr").length;        
        if(dataLength < 3) {
            getTabArticles(cate,page)
        }
        printPagination();
        pagenationOnOff(0);
    })
    $(tabBtn[0]).click();
    $(tabBtn[1]).on('click',function(event){
        event.preventDefault();
        $(tableLi).removeClass("active")
        $(tableLi[1]).addClass("active")
        var page = getUrlParam('page');        
        var cate = 'news';        
        var dataLength = $(".active .table tr").length;        

        if(dataLength < 3) {
            getTabArticles(cate,page)
        }       
        printPagination(); 
        pagenationOnOff(1);
    })
      
    function pagenationOnOff(num){
        $(paginationLi).css('display','none')
        $(paginationLi[num]).css('display', 'block')
        $(tabBtn).removeClass('active')
        $(tabBtn[num]).addClass('active')        
    }
    function getTabArticles(cate,page) {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/' + cate + '?page=' + page,
            headers: {
                Authorization: authToken
            },
            contentType: 'application/json; charset=utf-8',
            success: function(data){                
                getTabAllData(cate, data);
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting news: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting your news:\n' + jqXHR.responseText);
            }
        });        
    }
    function getTabAllData(cate, result){     
        for (i = 0; i < result['result'].length; i++) {
            tabUpdate(cate,i,result['result'][i])
        }          
    }

    function tabUpdate(cate, i, text) {
        switch(cate){            
            case "recruit":
                var available;
                if(text['available']==true){
                    available = "가능"
                } else {
                    available = "불가능"
                }
                $('#recruit').append($(                    
                    '<tr>\n <td>' + text['id'] + '</td>\n <td><a href="recruitment-board.html?page=' + i + '&id=' + text['id'] + '">' + text['title'] + '</a></td>\n <td>' + text['date'] + '</td>\n <td>' + text['kinds'] + '</td>\n <td>' + available + '</td>\n <td>' + text['count'] + '</td>\n <td><button class="get-btn" onclick="deleteArticle(\'recruit\',' + text['id'] + ')" style="margin-top:0; width: 50px">\uC0AD\uC81C</button></td>\n </tr>'
                ));
                
            break;
            case "news":
                $('#news').append($(        
                    '<tr>\n <td>' + text['id'] + '</td>\n <td><a href="news-post.html?page=' + i + '&id=' + text['id'] + '">' + text['title'] + '</a></td>\n <td>' + text['date'] + '</td>\n <td>' + text['count'] + '</td>\n <td><button class="get-btn" type="button" onclick="deleteArticle(\'news\',' + text['id'] + ')" style="margin-top:0; width: 50px">\uC0AD\uC81C</button></td>\n </tr>'
                ));                
            break;
        }
    }
    // pagenation 
    function printPagination(){
        var pagenationkey = "recruit";
        switch(pagenationkey){
            case "recruit":
                $.ajax({
                    method: 'GET',
                    url: _config.api.invokeUrl + '/' + pagenationkey,           
                    contentType: 'application/json; charset=utf-8',
                    success: function(data){                        
                        var targetPage = 0;
                        makePagenation(data, targetPage)
                    },
                    error: function ajaxError(jqXHR, textStatus, errorThrown) {
                        console.error('Error requesting news: ', textStatus, ', Details: ', errorThrown);
                        console.error('Response: ', jqXHR.responseText);
                        alert('An error occured when requesting your news:\n' + jqXHR.responseText);
                    }
                });
            pagenationkey = "news";        
            case "news":
                $.ajax({
                    method: 'GET',
                    url: _config.api.invokeUrl + '/' + pagenationkey,           
                    contentType: 'application/json; charset=utf-8',
                    success: function(data){                        
                        var targetPage = 1;
                        makePagenation(data,targetPage)
                    },
                    error: function ajaxError(jqXHR, textStatus, errorThrown) {
                        console.error('Error requesting news: ', textStatus, ', Details: ', errorThrown);
                        console.error('Response: ', jqXHR.responseText);
                        alert('An error occured when requesting your news:\n' + jqXHR.responseText);
                    }
                });
            break;
        }
    }
    
    
    function makePagenation(data,targetPage){
        var url = window.location.href;
        var checkUrlKey = url.split("/").slice(-1)[0];                     
        
        if(checkUrlKey !== 'pit-in.html'){      
            var paginationTab = document.getElementsByClassName("pagination-tab")[0]
            var pagination = paginationTab.getElementsByClassName("pagination")[targetPage];                           
            var pageLength = Math.ceil((data.total)/10);             
            var pageNum = url.split("=")[1].replace(/[a-z,#,&,_]/g, ""); 
            $(pagination).empty();
            
            for(var i=1; i <= pageLength; i++){
                var pageLi = document.createElement("li");
                var pageAT = document.createElement("a");        
                $(pageLi).attr("class","page-item");   
                $(pageAT).attr("class","page-link");      
                $(pageAT).attr("href", "circuit.html?page=" + i );
                $(pageAT).append(i);   
                if(i == pageNum){
                    $(pageLi).addClass("active"); 
                }
                $(pageLi).append(pageAT);     
                $(pagination).append(pageLi);
            }                             
            function makePageArrow(direction, pageNum,pageLength){
                switch(direction) {
                    case "left":          
                    if( 1 < pageNum && pageNum < pageLength){              
                        var pageNum = Number(pageNum) -1;               
                        var pageLi = document.createElement("li");        
                        var pageLeftArrow = document.createElement("a");
                        $(pageLeftArrow).attr("href", "circuit.html?page=" + pageNum + "#board")
                        var pageLeftArrowImg = document.createElement("img");
                        $(pageLeftArrowImg).attr("src", "img/icon-left-arrow.png");
                        $(pageLeftArrow).prepend(pageLeftArrowImg);
                        $(pageLi).append(pageLeftArrow);
                        $(pagination).prepend(pageLi);                 
                    }                             
                    break;          
                    case "right":          
                    if( pageNum < pageLength ){                        
                        var pageNum = Number(pageNum) +1;                                         
                        var pageLi = document.createElement("li");                  
                        var pageRightArrow = document.createElement("a");
                        $(pageRightArrow).attr("href", "circuit.html?page=" + pageNum + "#board")
                        var pageRightArrowImg = document.createElement("img");
                        $(pageRightArrowImg).attr("src", "img/icon-right-arrow.png");
                        $(pageRightArrow).append(pageRightArrowImg);
                        $(pageLi).append(pageRightArrow);          
                        $(pagination).append(pageLi); 
                    }
                    break;                          
                }
            }
            makePageArrow("left", pageNum, pageLength);
            makePageArrow("right", pageNum, pageLength);
        }     
    }
   
    // get single article
    function getArticle(article_id) {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/news?article='+ article_id,
            headers: {
                Authorization: authToken
            },
            contentType: 'application/json; charset= utf-8',
            success: completeArticleRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting news: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting your news:\n' + jqXHR.responseText);
            }
        });
    }
    function completeArticleRequest(result) {
        console.log('Response received from API: ', result);
        $('#article-title').val(result['result'].title);
        $('#summernote').summernote('code', result['result'].body);
    }

    // post article
    function postArticle( category, box) {
        $.ajax({
            type: 'POST',
            url: _config.api.invokeUrl + '/' + category,
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify(box),          
            contentType: 'application/json; charset= utf-8',
            success: completePostArticleRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error posting news: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when posting your news:\n' + jqXHR.responseText);
            }
        });
    }
    function completePostArticleRequest(result) {        
        window.location.href = 'circuit.html?page=1';
    }

    // Initialize
    $(function onDocReady() {
        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }

        // load datas
        var article_id = getUrlParam('article');        
        if (article_id == undefined) { // circuit.html
            // console.log('enter get all articles');
            var page = getUrlParam('page');
            // if (page == undefined){
            //     getAllArticles(1);
            // }
            // else{
            //     getAllArticles(page);
            // }
        } else { // pit-in.html
            // create new article, if article_id == -1
            $('#article_id').val(article_id);
            if (article_id > 0) {
                article = getArticle(article_id);
            }
        }

        // set click methods
        $('#signOut').click(function () {
            Cognito.signOut();
            alert("You have been signed out.");
            window.location = "/signin.html";
        });
        $('#create-post').click(function () {
            // create new article, if article_id == -1
            window.location = '/pit-in.html?article=-1';
        });
        $('.get-article').click(function () {
            window.location = $(this).data('href');
        });

        // set method in pit-in.html
        $('#postForm').submit(handlePostArticle);
    });   

    deleteArticle = function deleteArticle(category, id) {
            //  console.log('object :', category);
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/delete',            
            contentType: 'application/json; charset= utf-8',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                "object_id": id,
                "object_name": category
            }),
            success: function(){
                // window.location.href = 'circuit.html?page=1';            
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting news: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting your news:\n' + jqXHR.responseText);
            }
        });
    }

    function getUrlParam(param) {
        var queryString = window.location.search.slice(1);
        var result;
        if (queryString) {
            // get rid of stuff after #
            queryString = queryString.split('#')[0];
            var arr = queryString.split('&');

            for (var i = 0; i < arr.length; i++) {
                var a = arr[i].split('=');

                if (a[0] == param) {
                    return a[1]
                }
            }
            return result;
        }
        else {
            return result;
        }
    }

    function handlePostArticle(event) {
        var box = {};
        var category = $('#category').val();
        var article_id = $('#article_id').val();        
        if(article_id == ""){
            article_id = -1;
        }
        var title = $('#article-title').val();        
        var body = $('#summernote').summernote('code');        
        
        if(category == "recruit"){
            var date = $('#due-to').val(); 
            var kinds = $('#type').val();
            var available = $('#available').val();
            box = {
                'article_id' : article_id,
                'title' : title,
                'date' : date,
                'kinds' : kinds,
                'available' : available,
                'body' : body,
                'count': 0
            }         
        } else if(category == "news"){
            box = {
                'id' : article_id,
                'title' : title,
                'date' : $('#date').val(),
                'body' : body,
                'count': 0
            }
        }                      
        postArticle( category ,box);
        event.preventDefault();        
    }    
    
    

}(jQuery));