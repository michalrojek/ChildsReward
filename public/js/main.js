$(document).ready(function(){
    $('.delete-task-oneshot').on('click', function(e){
        $target = $(this);
        const id = $target.attr('data-id');
        console.log(e.target);
        $.ajax({
            type:'DELETE',
            url:'/dashboard/task/'+id,
            success: function(response){
                //alert('Zadanie zostało usunięte');
                window.location.href='/dashboard/oneshot';
            },
            error: function(err){
                console.log(err);
            }
        });
    });
    
    $('.complete-task-oneshot').on('click', function(e){
        $target = $(this);
        const id = $target.attr('data-id');
        console.log(e.target);
        $.ajax({
            type:'DELETE',
            url:'/dashboard/taskComplete/'+id,
            success: function(response){
                //alert('Zadanie zostało wykonane');
                window.location.href='/dashboard/oneshot';
            },
            error: function(err){
                console.log(err);
            }
        });
    });
    
    $('.delete-task-repeat').on('click', function(e){
        $target = $(this);
        const id = $target.attr('data-id');
        console.log(e.target);
        $.ajax({
            type:'DELETE',
            url:'/dashboard/task/'+id,
            success: function(response){
                //alert('Zadanie zostało usunięte');
                window.location.href='/dashboard/repeat';
            },
            error: function(err){
                console.log(err);
            }
        });
    });
    
    $('.complete-task-repeat').on('click', function(e){
        $target = $(this);
        const id = $target.attr('data-id');
        console.log(e.target);
        $.ajax({
            type:'DELETE',
            url:'/dashboard/taskComplete/'+id,
            success: function(response){
                //alert('Zadanie zostało wykonane');
                window.location.href='/dashboard/repeat';
            },
            error: function(err){
                console.log(err);
            }
        });
    });
    
    /*$('#selectProfile').on('change', function(e){
        $(this).attr('selected','selected');
        //alert($(this).val());
    });*/
    
    $(function() {
        if (localStorage.getItem('selectProfile')) {
            $("#selectProfile option").eq(localStorage.getItem('selectProfile')).prop('selected', true);
        }

        $("#selectProfile").on('change', function() {
            localStorage.setItem('selectProfile', $('option:selected', this).index());
        });
    }); 
});