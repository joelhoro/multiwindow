exports.config = {
    links: [
        ['link', [ 'Google', 'http://www.google.com' ]],
        ['link', [ 'CNN', 'http://www.cnn.com' ]],
        ['link', [ 'Disney', 'http://www.disney.com' ]],
        ['separator'],
        ['shell', ["Putty Local", "C:\\Program Files\\PuTTY\\putty.exe","-load Local"]],
        ['shell', ["Putty joel", "C:\\Program Files\\PuTTY\\putty.exe","-ssh joel@localhost 2222"]],
        ['separator'],
        ['shell', ["Open source folder", "explorer","c:\\users\\joel\\desktop\\opensource"]],
    ],
    componentTypes: [
        'Risk viewer',
        'VolGUI addin',
        'Browser',
      ],
      
    layouts: [
        'Bob',
        'Alice',
        'Charles',
    ]
}

