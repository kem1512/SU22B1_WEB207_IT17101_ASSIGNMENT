var app = angular.module('myapp', ['ngRoute'])

app.config(function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('')
    $routeProvider
        .when('/contact', {
            templateUrl: './contact.html'
        })
        .when('/register', {
            templateUrl: './register.html'
        })
        .when('/login', {
            templateUrl: './login.html',
        })
        .when('/forgot', {
            templateUrl: './forgot.html'
        })
        .when('/about', {
            templateUrl: './about.html'
        })
        .when('/feedback', {
            templateUrl: './feedback.html'
        })
        .when('/subject', {
            templateUrl: './subject.html'
        })
        .when('/faq', {
            templateUrl: './faq.html'
        })
        .when('/changepass', {
            templateUrl: './changepass.html'
        })
        .when('/profile', {
            templateUrl: './profile.html',
        })
        .when('/quizz', {
            templateUrl: './quizz.html'
        })
        .when('/account', {
            templateUrl: '../Admin/account.html',
        })
        .when('/m_quizz', {
            templateUrl: '../Admin/quizz.html',
        })
        .when('/history', {
            templateUrl: './history.html',
        })
        .otherwise({
            templateUrl: './subject.html',
        })
})

// Lịch sử thi
app.controller('history', function ($scope, $http, $location) {
    if ($scope.isLogin) {
        $scope.history = []
        var user = JSON.parse(sessionStorage.getItem('isLogin'))
        $http.get('https://62a0a59da9866630f8145222.mockapi.io/api/history').then(function (response) {
            $scope.history = response.data
        })

        $scope.filerRole = function () {
            return function (h) {
                return !user.role ? h.username == user.username : $scope.history;
            };
        };

        $scope.onDelete = function (index) {
            if (confirm('Bạn có chắc muốn xóa?')) {
                $http.delete('https://62a0a59da9866630f8145222.mockapi.io/api/history' + '/' + $scope.history[index].id).then(function (response) {
                    alert('Xóa thành công!')
                    $scope.history.splice(index, 1)
                })
            }
        }
    } else {
        $location.path('/login')
    }
})

// Chủ đề
app.controller('subject', function ($scope, $http, $location) {
    if ($scope.isLogin) {
        $scope.subjects = []
        $http.get('../db/Subjects.js').then(function (response) {
            $scope.subjects = response.data
            $scope.pageCount = Math.ceil($scope.subjects.length / 4)
        })

        $scope.begin = 0
        $scope.prev = function () {
            if ($scope.begin > 0) {
                $scope.begin -= 4
            }
        }

        $scope.next = function () {
            if ($scope.begin < ($scope.pageCount - 1) * 4) {
                $scope.begin += 4
            }
        }

        $scope.first = function () {
            $scope.begin = 0
        }

        $scope.last = function () {
            $scope.begin = ($scope.pageCount - 1) * 4
        }
    } else {
        $location.path('/login')
    }
})

// Chủ đề dọc
app.controller('category', function($scope, $http){
    $scope.subjects = []
    $http.get('../db/Subjects.js').then(function(response){
        $scope.subjects = response.data
    })
})

// Quản lý câu hỏi
app.controller('m-quizz', function ($scope, $http, $location) {
    if ($scope.student.role) {
        $scope.list_quizz = []
        $scope.quizz = {}
        const api = 'https://62a0a59da9866630f8145222.mockapi.io/api/quizz'
        $http.get(api).then(function (response) {
            $scope.list_quizz = response.data
        })
        $scope.onDisplay = function (index) {
            $scope.quizz = $scope.list_quizz[index]
        }
        $scope.onEdit = function (id) {
            if (id) {
                if (confirm('Bạn có chắc muốn sửa?')) {
                    $http.put(api + '/' + id, $scope.quizz).then(function (res) {
                        alert('Sửa thành công')
                    })
                }
            } else {
                alert('Không có dữ liệu để cập nhật!')
            }
        }
        $scope.onClear = function () {
            $scope.quizz = {}
        }

        $scope.onDelete = function (index) {
            if (index != -1) {
                if (confirm('Bạn có chắc muốn xóa?')) {
                    $http.delete(api + '/' + $scope.list_quizz[index].id).then(function () {
                        $scope.list_quizz.splice(index, 1)
                        alert('Xóa thành công!')
                    })
                }
            }
        }

        $scope.onAdd = function () {
            if ($scope.quizz.$valid) {
                if (confirm('Bạn có chắc muốn thêm?')) {
                    $http.post(api, $scope.quizz).then(function (res) {
                        $scope.list_quizz.push(res.data)
                        alert('Thêm thành công')
                    })
                }
            }
        }
    } else {
        $location.path('/login')
    }
})

// Làm bài thi
app.controller('quizz', function ($scope, $http, $location, $interval) {
    if ($scope.isLogin) {
        $scope.list_quizz = []
        $scope.start = function () {
            $scope.inProcess = true
            $http.get('https://62a0a59da9866630f8145222.mockapi.io/api/quizz').then(function (res) {
                $scope.list_quizz = res.data
            })

            $scope.m = 3
            $scope.s = 59

            var startQuizz = $interval(function () {
                if ($scope.s < 1 && $scope.m > 0) {
                    $scope.s = 59
                    $scope.m--
                } else {
                    if ($scope.m == 0 && $scope.s == 0 && $scope.inProcess == true) {
                        $scope.checkAndrews()
                        $interval.cancel(startQuizz)
                    } else {
                        $scope.s--
                    }
                }
            }, 1000);

            window.onbeforeunload = function () {
                return 'Are you sure you want to leave?';
            };

            $scope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
                if ($scope.inProcess) {
                    if (!confirm('Bạn có chắc muốn hủy thi?')) {
                        event.preventDefault()
                    }
                }
            })
        }

        $scope.saveHistory = function () {
            if (confirm('Bạn có muốn lưu lịch sử bài thi?')) {
                $scope.history = {}
                $scope.history.username = JSON.parse(sessionStorage.getItem('isLogin')).username
                $scope.history.score = $scope.score
                $scope.history.length = $scope.list_quizz.length
                $scope.history.time_check = Date.now()
                $http.post('https://62a0a59da9866630f8145222.mockapi.io/api/history', $scope.history)
            }
        }

        $scope.checkAndrews = function () {
            var dataChecked = $('input:checked')
            for (var i = 0; i < dataChecked.length; i++) {
                if (dataChecked[i].value == $scope.list_quizz[i].answers_true) {
                    $scope.score += 1
                }
            }
            alert('Bạn đúng ' + $scope.score + ' trên ' + $scope.list_quizz.length + ' câu!')
            $scope.saveHistory()
            $scope.reset()
        }

        $scope.reset = function () {
            $scope.inProcess = false
            $scope.score = 0
            $scope.index = 0
            $scope.m = 0
            $scope.s = 0
        }

        $scope.reset()

        $scope.complete = function () {
            if (confirm('Bạn có chắc muốn hoàn thành không?')) {
                $scope.checkAndrews()
            }
        }

        $scope.prev = function () {
            if ($scope.index > 0) {
                $scope.index -= 1
            }
        }

        $scope.page = function (index) {
            $scope.index = index
        }

        $scope.next = function () {
            if ($scope.index < $scope.list_quizz.length - 1) {
                $scope.index += 1
            }
        }
    } else {
        $location.path('/login')
    }
})

// Đăng nhập
app.controller('login', function ($scope, $http, $location) {
    $scope.students = []
    const api = 'https://62a0a59da9866630f8145222.mockapi.io/api/students'
    $http.get(api).then(function (response) {
        $scope.students = response.data
    })

    $scope.onLogin = function () {
        for (var i = 0; i < $scope.students.length; i++) {
            if ($scope.students[i].username == $scope.student.username && $scope.students[i].password == $scope.student.password) {
                $scope.onLoginMain($scope.students[i])
                $location.path('/subject')
                return
            }
        }
        alert('Sai tài khoản hoặc mật khẩu!')
    }
})

// Trang chủ
app.controller('main', function ($scope, $location) {
    $scope.reset = function () {
        $scope.isLogin = false
        $scope.student = {}
        $scope.welcome = 'Xin chào'
    }
    $scope.reset()
    if (sessionStorage.getItem('isLogin')) {
        $scope.isLogin = true
        $scope.student = JSON.parse(sessionStorage.getItem('isLogin'))
        $scope.welcome = 'Xin chào ' + $scope.student.username
    }

    $scope.onLoginMain = function (student) {
        sessionStorage.setItem('isLogin', JSON.stringify(student))
        $scope.isLogin = true
        $scope.student = student
        $scope.welcome = 'Xin chào ' + student.username
    }

    $scope.onLogout = function () {
        if ($scope.isLogin) {
            sessionStorage.removeItem('isLogin')
            $scope.reset()
            $location.path('/login')
        }
    }
})

// Quản lý tài khoản
app.controller('account', function ($scope, $http, $location) {
    if ($scope.student.role && $scope.isLogin) {
        const api = 'https://62a0a59da9866630f8145222.mockapi.io/api/students'
        $scope.students = []
        $scope.st = {}
        $http.get(api).then(function (response) {
            $scope.students = response.data
        })

        $scope.onDisplay = function (index) {
            $scope.students[index].birthday = new Date($scope.students[index].birthday)
            $scope.st = $scope.students[index]
        }

        $scope.onClear = function () {
            $scope.st = {}
        }

        $scope.onAdd = function () {
            if ($scope.account.$valid) {
                if (confirm('Bạn có chắc muốn thêm?')) {
                    for (var i = 0; i < $scope.students.length; i++) {
                        if ($scope.st.username == $scope.students[i].username || $scope.st.email == $scope.students[i].email) {
                            alert('Đã tồn tại tài khoản hoặc email!')
                            return
                        }
                    }
                    
                    $http.post(api, $scope.st).then(function (response) {
                        $scope.students.push(response.data)
                        alert('Thêm thành công!')
                    })
                }
            }
        }

        $scope.onEdit = function (id) {
            if ($scope.account.$valid) {
                if (id) {
                    if (confirm('Bạn có chắc muốn sửa?')) {
                        $http.put(api + '/' + id, $scope.st).then(function (response) {
                            alert('Sửa thành công')
                        })
                    }
                } else {
                    alert('Không có dữ liệu để cập nhật!')
                }
            }
        }

        $scope.onDelete = function (index) {
            if (index != -1) {
                if (confirm('Bạn có chắc muốn xóa')) {
                    $http.delete(api + '/' + $scope.students[index].id).then(function (response) {
                        $scope.students.splice(index, 1)
                    })
                }
            }
        }
    } else {
        $location.path('/login')
    }
})

// Đổi mật khẩu
app.controller('changepass', function ($scope, $location) {
    if ($scope.isLogin) {

    } else {
        $location.path('/login')
    }
})

// Thông tin cá nhân
app.controller('profile', function ($scope, $http, $location) {
    $scope.st = {}
    if ($scope.isLogin) {
        var user = JSON.parse(sessionStorage.getItem('isLogin'))
        user.birthday = new Date(user.birthday)
        $scope.st = user
        $scope.onUpdate = function () {
            if (confirm('Bạn có chắc muốn sửa?')) {
                $http.put('https://62a0a59da9866630f8145222.mockapi.io/api/students/' + user.id, $scope.st).then(function (res) {
                    alert('Sửa thành công!')
                })
            }
        }
    } else {
        $location.path('/login')
    }
})

// Đăng ký
app.controller('register', function ($scope, $location, $http) {
    if (!$scope.isLogin) {
        $scope.users = []
        const path = 'https://62a0a59da9866630f8145222.mockapi.io/api/students'
        $http.get(path).then(function (res) {
            $scope.users = res.data
        })
        $scope.onAdd = function () {
            if ($scope.register.$valid) {
                if ($scope.user.password != $scope.repassword) {
                    alert('Mật khẩu phải giống nhau!')
                } else {
                    for (var i = 0; i < $scope.users.length; i++) {
                        if ($scope.user.username == $scope.users[i].username) {
                            alert('Đã tồn tại!')
                            return
                        }
                    }
                    $http.post(path, $scope.user).then(function (response) {
                        alert('Thêm thành công!')
                    })
                }
            }
        }
    } else {
        $location.path('/subject')
    }
})

// Quên mật khẩu
app.controller('forgot', function ($scope, $http, $location) {
    if (!$scope.isLogin) {
        $scope.users = []
        const path = 'https://62a0a59da9866630f8145222.mockapi.io/api/students'
        $http.get(path).then(function (res) {
            $scope.users = res.data
        })
        $scope.onForgot = function () {
            for (var i = 0; i < $scope.users.length; i++) {
                if ($scope.users[i].username == $scope.email_user || $scope.users[i].email == $scope.email_user) {
                    alert('Mật khẩu của bạn là ' + $scope.users[i].password)
                    return
                }
            }
            alert('Không tồn tại email hoặc tài khoản này!')
        }
    } else {
        $location.path('/subject')
    }
})

// Active
app.controller('activeLink', function ($scope, $location) {
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
})

