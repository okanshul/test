# laravel 11 CRUD

## 1. Install Laravel

Open terminal and run the following command to create a new Laravel project:

```dsconfig
composer create-project laravel/laravel project-name

cd project-name

php artisan serve
```

## 2. MySQL Database Configuration

Open `.env` file and add the following configuration:
```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

## 3. Create Migration

```dsconfig
php artisan make:migration create_task_table --create=task
```
Open `database/migrations` folder and create a new migration file with the following code:

```php
Schema::create('tasks', function (Blueprint $table) {
    $table->id();
    $table->string('task_name');
    $table->text('description');
    $table->timestamps();
});
```
```dsconfig
php artisan migrate
```

## 4. Create Model

```dsconfig
php artisan make:model Task
```
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $table = 'tasks';

    protected $fillable = [
        'task_name',
        'description'
    ];
}

```
## 5. Create Controller

```dsconfig
php artisan make:controller TaskController
```
```php
<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    public function index()
    {
        $tasks = Task::get();
        return view('task', compact('tasks'));
    }
    
    public function create()
    {
        return view('create');
    }
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'task_name' => 'required|string|max:255',
            'description' => 'required|string|max:2055'
        ]);
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        } else {
            $task = Task::create([
                'task_name' => $request->task_name,
                'description' => $request->description
            ]);
            return redirect()->route('task')
                            ->with(['status' => 'success', 'message' => 'Task created successfully']);
        }
    }

    public function show($id){
        $task = Task::where('id', $id)->first();
        return view('show', compact('task'));
    }

    public function edit($id)
    {
        $task = Task::where('id', $id)->first();
        return view('edit', compact('task'));
    }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'task_name' => 'required|string|max:255',
            'description' => 'required|string|max:2055'
        ]);
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        } 

        $task = Task::where('id', $request->id)->count();
        if($task != 0) {
            $task = Task::where('id', $request->id)->update([
                'task_name' => $request->task_name,
                'description' => $request->description
            ]);
            return redirect()->route('task')
                            ->with(['status' => 'success', 'message' => 'Task updated successfully']);
        }else {
            return redirect()->back()->with(['status' => 'error', 'message' => 'Task not found']);
        }
    }

    public function delete(Request $request)
    {
        $task = Task::where('id', $request->id)->count();
        if ($task != 0) {
            Task::where('id', $request->id)->delete();
            return response()->json(['status' => 'success', 'message' => 'Task deleted successfully']);
        }else {
            return redirect()->back()->with(['status' => 'error', 'message' => 'Task not found']);
        }
    }
}
```
## 6. Create Route
Open `routes/web.php` file and add the following code:
```php
<?php

use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::get('/task', [TaskController::class, 'index'])->name('index');
Route::get('/task/create', [TaskController::class, 'create'])->name('create');
Route::post('/task/store', [TaskController::class, 'store'])->name('store');
Route::get('/task/show/{id}', [TaskController::class, 'show'])->name('show');
Route::get('/task/edit/{id}', [TaskController::class, 'edit'])->name('edit');
Route::put('/task/update', [TaskController::class, 'update'])->name('update');
Route::delete('/task/delete', [TaskController::class, 'delete'])->name('delete');
```
## 7. Create Views
Create the following views in the `resources/views` directory:
- `task.blade.php`
- `create.blade.php`
- `show.blade.php`
- `edit.blade.php`

Add the following code to each view file:

`task.blade.php`
```blade
@extends('layouts.app')

@section('content')
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">Tasks</div>

                    <div class="card-body">
                        @if(session('status'))
                            <div class="alert alert-{{ session('status') }}">
                                {{ session('message') }}
                            </div>
                        @endif

                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Task Name</th>
                                    <th scope="col">Description</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($tasks as $task)
                                    <tr>
                                        <th scope="row">{{ $task->id }}</th>
                                        <td>{{ $task->task_name }}</td>
                                        <td>{{ $task->description }}</td>
                                        <td>
                                            <a href="{{ route('show', $task->id) }}" class="btn btn-primary">Show</a>
                                            <a href="{{ route('edit', $task->id) }}" class="btn btn-warning">Edit</a>
                                            <form action="{{ route('delete') }}" method="POST" style="display: inline;">
                                                @csrf
                                                @method('DELETE')
                                                <input type="hidden" name="id" value="{{ $task->id }}">
                                                <button type="submit" class="btn btn-danger">Delete</button>
                                            </form>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
```
`create.blade.php`
```blade
@extends('layouts.app')

@section('content')
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">Create Task</div>

                    <div class="card-body">
                        <form action="{{ route('store') }}" method="POST">
                            @csrf

                            <div class="form-group">
                                <label for="task_name">Task Name</label>
                                <input type="text" class="form-control @error('task_name') is-invalid @enderror" value="{{ old('task_name') }}" id="task_name" name="task_name" placeholder="Enter task name" value="{{ old('task_name') }}">
                            </div>
                            @error('task_name')
                                <div class="invalid-feedback">
                                    {{ $message }}
                                </div>
                            @enderror

                            <div class="form-group">
                                <label for="description">Description</label>
                                <textarea class="form-control @error('description') is-invalid @enderror" id="description" name="description" placeholder="Enter description">{{ old('description') }}</textarea>
                            </div>
                            @error('description')
                                <div class="invalid-feedback">
                                    {{ $message }}
                                </div>
                            @enderror

                            <button type="submit" class="btn btn-primary">Create</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
```
`show.blade.php`
```blade
@extends('layouts.app')

@section('content')
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">Task Details</div>

                    <div class="card-body">
                        <h5 class="card-title">{{ $task->task_name }}</h5>
                        <p class="card-text">{{ $task->description }}</p>
                        <a href="{{ route('edit', $task->id) }}" class="btn btn-warning">Edit</a>
                        <form action="{{ route('delete') }}" method="POST" style="display: inline;">
                            @csrf
                            @method('DELETE')
                            <input type="hidden" name="id" value="{{ $task->id }}">
                            <button type="submit" class="btn btn-danger">Delete</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
```

`edit.blade.php`
```blade
@extends('layouts.app')

@section('content')
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">Edit Task</div>

                    <div class="card-body">
                        <form action="{{ route('update', $task->id) }}" method="POST">
                            @csrf
                            @method('PUT')

                            <div class="form-group">
                                <label for="task_name">Task Name</label>
                                <input type="text" class="form-control @error('task_name') is-invalid @enderror" id="task_name" name="task_name" value="{{ $task->task_name }}">
                            </div>
                            @error('task_name')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror

                            <div class="form-group">
                                <label for="description">Description</label>
                                <textarea class="form-control @error('description') is-invalid @enderror" id="description" name="description">{{ $task->description }}</textarea>
                            </div>
                            @error('description')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror

                            <button type="submit" class="btn btn-primary">Update</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
```
`app.blade.php`
```blade
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Management</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a class="navbar-brand" href="{{ route('index') }}">Task Management</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link" href="{{ route('create') }}">Create Task</a>
                </li>
            </ul>
        </div>
    </nav>

    <div class="container mt-4">
        @yield('content')
    </div>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
</body>
</html>
```

## 8. Run the Application
Run the application using the following command:
```dsconfig
php artisan serve
```
Open your web browser and navigate to `http://localhost:8000/task` to see the list of tasks.
